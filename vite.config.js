import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev only: lets the page save a still of the live canvas into public/
// (the poster shown before the 3D loads, and the share image).
function saveStill() {
  return {
    name: 'save-still',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__still', (req, res) => {
        const name = new URL(req.url, 'http://localhost').searchParams.get('name') || '';
        if (req.method !== 'POST' || !/^[a-z0-9-]+\.(webp|jpg|png)$/.test(name)) {
          res.statusCode = 400;
          return res.end('bad request');
        }
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          fs.writeFileSync(path.join(server.config.root, 'public', name), Buffer.concat(chunks));
          res.end('saved ' + name);
        });
      });
    },
  };
}

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || '/',
  plugins: [react(), saveStill()],
  server: { port: 5184, strictPort: false },
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
});
