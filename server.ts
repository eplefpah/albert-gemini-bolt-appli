import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Preconfigured Credentials
const ALBERT_API_KEY =
  process.env.ALBERT_API_KEY ||
  'sk-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNzQ1NCwidG9rZW5faWQiOjYyOTI1LCJleHBpcmVzIjoxODIxNzM2ODAwfQ.7P1delg6j--1zjiSTy4jAC1t2hHNL_ZFWJDswZCUs50';
const ALBERT_BASE_URL =
  process.env.ALBERT_BASE_URL || 'https://albert.api.etalab.gouv.fr/v1';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://185.219.215.120:8007';
const SUPABASE_USER = process.env.SUPABASE_USER || 'supabase';
const SUPABASE_PASSWORD = process.env.SUPABASE_PASSWORD || '&1Supabase;';

const getBasicAuthHeader = (u = SUPABASE_USER, p = SUPABASE_PASSWORD) => {
  return 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');
};

// --- ROUTES SANTÉ & DIAGNOSTICS ---
app.get('/api/health', async (_req: Request, res: Response) => {
  let albertOk = false;
  let albertLatencyMs = 0;
  let supabaseOk = false;
  let supabaseLatencyMs = 0;

  // Test Albert
  try {
    const start = Date.now();
    const resp = await fetch(`${ALBERT_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${ALBERT_API_KEY}` },
      signal: AbortSignal.timeout(6000),
    });
    albertLatencyMs = Date.now() - start;
    albertOk = resp.ok;
  } catch {
    albertOk = false;
  }

  // Test Supabase
  try {
    const start = Date.now();
    const resp = await fetch(SUPABASE_URL, {
      headers: { Authorization: getBasicAuthHeader() },
      signal: AbortSignal.timeout(6000),
    });
    supabaseLatencyMs = Date.now() - start;
    supabaseOk = resp.status < 500;
  } catch {
    supabaseOk = false;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    albert: {
      connected: albertOk,
      latencyMs: albertLatencyMs,
      endpoint: ALBERT_BASE_URL,
    },
    supabase: {
      connected: supabaseOk,
      latencyMs: supabaseLatencyMs,
      url: SUPABASE_URL,
    },
  });
});

// --- ROUTES PROXY ALBERT DINUM ---

// 1. Liste des modèles
app.get('/api/albert/models', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${customKey}`,
      },
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur proxy Albert' });
  }
});

// 2. Chat Completions (avec support Streaming SSE)
app.post('/api/albert/chat/completions', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  const isStream = req.body?.stream === true;

  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customKey}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }

    if (isStream && resp.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      return res.end();
    } else {
      const data = await resp.json();
      return res.json(data);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur proxy Albert chat' });
  }
});

// 3. Recherche sémantique / RAG (/v1/search)
app.post('/api/albert/search', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customKey}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!resp.ok) {
      // Fallback local simulé si la collection RAG de l'endpoint n'est pas configurée
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur proxy Albert search' });
  }
});

// 4. Embeddings (/v1/embeddings)
app.post('/api/albert/embeddings', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customKey}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur proxy Albert embeddings' });
  }
});

// 5. Transcription Audio (/v1/audio/transcriptions)
app.post('/api/albert/audio/transcriptions', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  const {
    audioBase64,
    fileName = 'recording.wav',
    mimeType = 'audio/wav',
    model = 'whisper-large-v3',
    language = 'fr',
    prompt,
    response_format = 'json',
    temperature,
  } = req.body || {};

  if (!audioBase64) {
    return res.status(400).json({ error: 'Fichier audio manquant (audioBase64 requis)' });
  }

  try {
    const buffer = Buffer.from(audioBase64, 'base64');
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('model', model);
    if (language) formData.append('language', language);
    if (prompt) formData.append('prompt', prompt);
    if (response_format) formData.append('response_format', response_format);
    if (typeof temperature === 'number') formData.append('temperature', String(temperature));

    const resp = await fetch(`${ALBERT_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customKey}`,
      },
      body: formData,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur lors de la transcription audio' });
  }
});

// 6. Gestion des Collections RAG (/v1/collections)
app.get('/api/albert/collections', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  const limit = req.query.limit || '100';
  const offset = req.query.offset || '0';
  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/collections?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${customKey}` },
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }
    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur récupération collections' });
  }
});

app.post('/api/albert/collections', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customKey}`,
      },
      body: JSON.stringify(req.body),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }
    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur création collection' });
  }
});

app.delete('/api/albert/collections/:id', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  const { id } = req.params;
  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/collections/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customKey}` },
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }
    return res.json({ success: true, deletedId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur suppression collection' });
  }
});

// 7. Gestion des Documents RAG (/v1/documents)
app.get('/api/albert/documents', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  const collectionId = req.query.collection_id;
  const limit = req.query.limit || '50';
  let url = `${ALBERT_BASE_URL}/documents?limit=${limit}`;
  if (collectionId) {
    url += `&collection_id=${collectionId}`;
  }

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${customKey}` },
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }
    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur récupération documents' });
  }
});

app.post('/api/albert/documents', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  const {
    fileBase64,
    fileName = 'document.txt',
    mimeType = 'text/plain',
    name,
    collection_id,
    chunk_size = 2048,
    chunk_overlap = 100,
  } = req.body || {};

  if (!fileBase64 || !collection_id) {
    return res.status(400).json({ error: 'fileBase64 et collection_id requis' });
  }

  try {
    const buffer = Buffer.from(fileBase64, 'base64');
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('collection_id', String(collection_id));
    if (name) formData.append('name', name);
    if (chunk_size) formData.append('chunk_size', String(chunk_size));
    if (chunk_overlap) formData.append('chunk_overlap', String(chunk_overlap));

    const resp = await fetch(`${ALBERT_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customKey}`,
      },
      body: formData,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur import document' });
  }
});

app.delete('/api/albert/documents/:id', async (req: Request, res: Response) => {
  const customKey = (req.headers['x-albert-key'] as string) || ALBERT_API_KEY;
  const { id } = req.params;
  try {
    const resp = await fetch(`${ALBERT_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customKey}` },
    });
    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: errText });
    }
    return res.json({ success: true, deletedId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur suppression document' });
  }
});


// --- ROUTES PROXY SUPABASE PRIVÉ ---

// 1. Statut & Test de connexion
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  const targetUrl = (req.query.url as string) || SUPABASE_URL;
  const user = (req.query.user as string) || SUPABASE_USER;
  const pass = (req.query.pass as string) || SUPABASE_PASSWORD;

  try {
    const start = Date.now();
    const resp = await fetch(targetUrl, {
      headers: { Authorization: getBasicAuthHeader(user, pass) },
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - start;

    return res.json({
      connected: resp.status < 500,
      statusCode: resp.status,
      latencyMs,
      url: targetUrl,
      authenticated: resp.status !== 401,
    });
  } catch (err: any) {
    return res.json({
      connected: false,
      statusCode: 0,
      latencyMs: 0,
      url: targetUrl,
      error: err.message || 'Hôte Supabase inaccessible',
    });
  }
});

// In-memory sync storage fallback on server (pour garantir la persistance immédiate sans table SQL requise)
const storedSessions: Record<string, any> = {};

// 2. Synchronisation / Sauvegarde d'une session
app.post('/api/supabase/sync', async (req: Request, res: Response) => {
  const { session, storageType } = req.body;
  if (!session || !session.id) {
    return res.status(400).json({ error: 'Session invalide ou manquante' });
  }

  // Stocker dans le tampon serveur
  storedSessions[session.id] = {
    ...session,
    serverSyncedAt: new Date().toISOString(),
  };

  // Tenter également l'envoi vers l'instance Supabase si une table PostgREST est configurée
  let remoteSyncStatus = 'buffered_locally';
  try {
    const postgrestUrl = `${SUPABASE_URL}/rest/v1/albert_sessions`;
    const resp = await fetch(postgrestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getBasicAuthHeader(),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: session.id,
        title: session.title,
        data: session,
        updated_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (resp.ok) {
      remoteSyncStatus = 'supabase_stored';
    }
  } catch {
    remoteSyncStatus = 'saved_in_server_buffer';
  }

  return res.json({
    success: true,
    sessionId: session.id,
    remoteSyncStatus,
    timestamp: new Date().toISOString(),
  });
});

// 3. Récupération des sessions sauvegardées
app.get('/api/supabase/sessions', async (_req: Request, res: Response) => {
  return res.json({
    sessions: Object.values(storedSessions),
    count: Object.keys(storedSessions).length,
  });
});

// --- EXPORT IONOS ---
app.get('/api/ionos/export', (_req: Request, res: Response) => {
  const exportPayload = {
    metadata: {
      systeme: 'Albert DINUM · Agrocampus Saint-Germain-en-Laye',
      dossier_cible: '/data/',
      date_export: new Date().toISOString(),
      nombre_sessions: Object.keys(storedSessions).length,
    },
    sessions: Object.values(storedSessions),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="albert_data_ionos_${new Date().toISOString().slice(0, 10)}.json"`
  );
  return res.send(JSON.stringify(exportPayload, null, 2));
});

// --- LANCEMENT AVEC VITE EN DEV / STATIQUE EN PROD ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Albert Console] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Albert Console] Échec du démarrage du serveur:', err);
  process.exit(1);
});
