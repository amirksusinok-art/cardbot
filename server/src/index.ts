import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';
import { getDb } from './db.js';
import { initBot } from './bot.js';
import { router } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Connect to DB
  await getDb();

  // Initialize bot if token provided
  initBot();

  // Mount API
  app.use('/api', router);

  // Serve Frontend static assets if built
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    console.log(`[SERVER] Serving static frontend from ${clientDist}`);
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else {
    console.log('[SERVER] client/dist not found yet. Vite dev server can be used for frontend.');
  }

  const port = Number(CONFIG.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[SERVER] Black Cards & VIP Plastic backend running on port ${port}`);
    console.log(`[SERVER] Local URL: http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Fatal startup error:', err);
  process.exit(1);
});
