<?php
/**
 * Proxy de l'API Albert (DINUM) pour hébergement mutualisé PHP (O2Switch, cPanel…).
 *
 * Le navigateur appelle   api/albert.php?endpoint=chat/completions
 * et ce script relaie la requête vers https://albert.api.etalab.gouv.fr/v1/chat/completions
 * en y ajoutant la clé API, qui reste ainsi sur le serveur (fichier config.php).
 *
 * Les réponses (y compris le flux SSE du chat) sont retransmises telles quelles.
 */

declare(strict_types=1);

// Seuls les points d'accès utilisés par l'application sont relayés.
const ALLOWED_ENDPOINTS = '#^(models|chat/completions|search|embeddings|audio/transcriptions|collections|documents)(/[A-Za-z0-9_-]+)?$#';

function send_json_error(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$configFile = __DIR__ . '/config.php';
$config = is_file($configFile) ? require $configFile : [];
if (!is_array($config)) {
    $config = [];
}
$baseUrl = rtrim((string) ($config['albert_base_url'] ?? 'https://albert.api.etalab.gouv.fr/v1'), '/');

if (!function_exists('curl_init')) {
    send_json_error(500, "L'extension PHP cURL n'est pas activée sur l'hébergement.");
}

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if (!in_array($method, ['GET', 'POST', 'DELETE'], true)) {
    send_json_error(405, 'Méthode non autorisée.');
}

$endpoint = trim((string) ($_GET['endpoint'] ?? ''), '/');
if (!preg_match(ALLOWED_ENDPOINTS, $endpoint)) {
    send_json_error(404, "Point d'accès Albert non autorisé : « {$endpoint} ».");
}

// Clé personnelle saisie dans les paramètres de l'application, sinon clé du serveur.
$userKey = trim((string) ($_SERVER['HTTP_X_ALBERT_KEY'] ?? ''));
$apiKey = $userKey !== '' ? $userKey : trim((string) ($config['albert_api_key'] ?? ''));
if ($apiKey === '') {
    send_json_error(500, "Aucune clé API Albert configurée : renseignez-la dans le fichier api/config.php du serveur.");
}

$query = $_GET;
unset($query['endpoint']);
$url = $baseUrl . '/' . $endpoint . ($query ? '?' . http_build_query($query) : '');

$headers = [
    'Authorization: Bearer ' . $apiKey,
    'Accept: ' . (string) ($_SERVER['HTTP_ACCEPT'] ?? '*/*'),
    'Expect:',
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT => 600,
    CURLOPT_FOLLOWLOCATION => false,
]);

if ($method === 'POST') {
    $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? '');

    if (stripos($contentType, 'multipart/form-data') === 0) {
        // PHP a déjà décodé l'envoi multipart dans $_POST / $_FILES : on le reconstruit pour Albert.
        if (empty($_POST) && empty($_FILES) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
            send_json_error(413, 'Fichier trop volumineux pour l\'hébergement (post_max_size = ' . ini_get('post_max_size') . ').');
        }

        $fields = $_POST;
        foreach ($_FILES as $name => $file) {
            if (is_array($file['tmp_name'])) {
                continue;
            }
            if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
                send_json_error(413, 'Fichier trop volumineux pour l\'hébergement (upload_max_filesize = ' . ini_get('upload_max_filesize') . ').');
            }
            if ($file['error'] !== UPLOAD_ERR_OK) {
                send_json_error(400, "Échec de l'envoi du fichier (code {$file['error']}).");
            }
            $fields[$name] = new CURLFile(
                $file['tmp_name'],
                $file['type'] !== '' ? $file['type'] : 'application/octet-stream',
                $file['name']
            );
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    } else {
        $headers[] = 'Content-Type: ' . ($contentType !== '' ? $contentType : 'application/json');
        curl_setopt($ch, CURLOPT_POSTFIELDS, (string) file_get_contents('php://input'));
    }
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Retransmission au fil de l'eau (indispensable pour l'affichage progressif des réponses du chat).
@ini_set('zlib.output_compression', '0');
@ini_set('implicit_flush', '1');
while (ob_get_level() > 0) {
    ob_end_flush();
}
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}
@set_time_limit(600);

$responseStarted = false;
$upstreamContentType = 'application/json';

curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($ch, string $line) use (&$upstreamContentType): int {
    if (stripos($line, 'HTTP/') === 0) {
        $upstreamContentType = 'application/json';
    } elseif (stripos($line, 'content-type:') === 0) {
        $upstreamContentType = trim(substr($line, strlen('content-type:')));
    }
    return strlen($line);
});

curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, string $chunk) use (&$responseStarted, &$upstreamContentType): int {
    if (!$responseStarted) {
        $responseStarted = true;
        http_response_code((int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE) ?: 502);
        header('Content-Type: ' . $upstreamContentType);
        header('Cache-Control: no-cache, no-store');
        header('X-Accel-Buffering: no');
    }
    echo $chunk;
    flush();
    // Arrête le transfert si le navigateur a fermé la connexion.
    return connection_aborted() ? 0 : strlen($chunk);
});

$ok = curl_exec($ch);

if (!$responseStarted) {
    if ($ok === false) {
        send_json_error(502, "Impossible de joindre l'API Albert : " . curl_error($ch));
    }
    // Réponse sans corps (ex. suppression réussie).
    http_response_code((int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE) ?: 502);
}
