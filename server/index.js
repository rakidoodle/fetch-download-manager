import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app.js';
import { DownloadManager } from './manager.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4317);
const manager = await new DownloadManager({ dataDir: process.env.FETCH_DATA_DIR || path.join(root, '.data'), downloadDir: process.env.FETCH_DOWNLOAD_DIR || path.join(root, 'downloads'), aria2: process.env.ARIA2_BIN || 'aria2c', ytdlp: process.env.YTDLP_BIN || 'yt-dlp' }).init();
const app = createApp(manager, { allowedPort: port });
let vite;
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  vite = await createServer({ server: { middlewareMode: true, hmr: { port: port + 100, host: 'localhost' } }, appType: 'spa' }); app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(root, 'dist')));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
}
const server = app.listen(port, '127.0.0.1', () => console.log(`Fetch is ready: http://localhost:${port}`));
let stopping = false;
async function stop() { if (stopping) return; stopping = true; server.close(); await vite?.close(); await manager.close(); process.exit(0); }
server.on('error', async e => { console.error(e.message); await manager.close(); process.exit(1); });
process.on('SIGINT', stop); process.on('SIGTERM', stop);
