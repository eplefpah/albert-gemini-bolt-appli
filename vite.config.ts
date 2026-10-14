import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const albertBase = new URL(env.ALBERT_BASE_URL || 'https://albert.api.etalab.gouv.fr/v1');

  return {
    // Chemins relatifs : l'application fonctionne à la racine du domaine comme dans un sous-dossier.
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // En développement, reproduit le proxy PHP public/api/albert.php utilisé en production.
      // La clé est lue dans le fichier .env (ALBERT_API_KEY).
      proxy: {
        '/api/albert.php': {
          target: albertBase.origin,
          changeOrigin: true,
          rewrite: (url) => {
            const {searchParams} = new URL(url, 'http://localhost');
            const endpoint = searchParams.get('endpoint') || '';
            searchParams.delete('endpoint');
            const query = searchParams.toString();
            return `${albertBase.pathname.replace(/\/$/, '')}/${endpoint}${query ? `?${query}` : ''}`;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const userKey = req.headers['x-albert-key'];
              const key = typeof userKey === 'string' && userKey.trim() ? userKey.trim() : env.ALBERT_API_KEY;
              proxyReq.setHeader('Authorization', `Bearer ${key || ''}`);
              proxyReq.removeHeader('x-albert-key');
            });
          },
        },
      },
    },
  };
});
