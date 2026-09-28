# Mise en ligne chez O2Switch

L'application est un site statique (HTML, CSS, JS) accompagné d'un petit fichier PHP,
`api/albert.php`, qui relaie les requêtes vers l'API Albert en y ajoutant la clé API.
La clé reste sur le serveur : elle n'apparaît jamais dans le navigateur des visiteurs.
Aucune base de données ni serveur Node.js n'est nécessaire.

## 1. Construire le site

```bash
npm install
npm run build
```

Le dossier `dist/` contient tout ce qu'il faut déposer :

```
dist/
├── .htaccess          ← HTTPS forcé, cache des fichiers
├── index.html
├── assets/            ← JS, CSS et lecteur PDF
└── api/
    ├── .htaccess      ← protège la configuration
    ├── .user.ini      ← taille maximale des fichiers envoyés (64 Mo)
    ├── albert.php     ← proxy vers l'API Albert
    └── config.example.php
```

## 2. Déposer les fichiers

1. cPanel O2Switch → **Gestionnaire de fichiers** → dossier `public_html/`
   (ou le dossier du sous-domaine, ou un sous-dossier : les chemins sont relatifs).
2. Envoyer le **contenu** de `dist/` (pas le dossier lui-même). Le plus simple :
   compresser ce contenu en .zip, l'envoyer puis faire clic droit → **Extraire**.
3. Les fichiers `.htaccess` et `.user.ini` sont masqués par défaut : cliquer sur
   **Paramètres → Afficher les fichiers cachés** pour les voir.

## 3. Configurer la clé API (une seule fois)

Dans `api/`, copier `config.example.php` sous le nom `config.php` et y coller la clé Albert :

```php
return [
    'albert_api_key' => 'sk-...',
    'albert_base_url' => 'https://albert.api.etalab.gouv.fr/v1',
];
```

`config.php` n'est pas écrasé lors des mises à jour suivantes (il n'est pas dans le build).

## 4. Vérifier

- Ouvrir `https://votre-domaine/api/albert.php?endpoint=models` : la liste des modèles
  Albert doit s'afficher au format JSON.
- Dans l'application : **Outils → Inspecteur API** indique l'état de la connexion.

## Mettre à jour

Refaire `npm run build` et redéposer le contenu de `dist/` en écrasant les fichiers.
Les anciens fichiers de `assets/` peuvent être supprimés.

## Dépannage

| Symptôme | Cause probable |
| --- | --- |
| « Aucune clé API Albert configurée » | `api/config.php` absent ou clé vide |
| « le proxy api/albert.php est introuvable » | dossier `api/` non déposé à côté de `index.html` |
| Erreur 401 | clé API invalide ou expirée |
| Réponses affichées d'un bloc au lieu de mot à mot | compression activée par l'hébergeur (sans gravité) |
| Micro inaccessible | le site doit être ouvert en HTTPS |

## Développement local

Copier `.env.example` en `.env`, y mettre la clé, puis `npm run dev` :
le serveur de développement reproduit le proxy `api/albert.php`.
