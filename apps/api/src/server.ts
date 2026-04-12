import 'dotenv/config';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { subscribe, unsubscribe } from './events/pubsub';
import { startVideoWorker } from './jobs/video.worker';
import { startBudgetResetCron } from './jobs/budget-reset';
import { ensureBucket } from './lib/storage';

const app = createApp();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const KUDO_CHANNELS = ['kudo:created', 'kudo:reaction', 'kudo:comment'];

wss.on('connection', (ws) => {
  const handler = (data: unknown) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  KUDO_CHANNELS.forEach((ch) => subscribe(ch, handler));
  ws.on('close', () => KUDO_CHANNELS.forEach((ch) => unsubscribe(ch, handler)));
});

ensureBucket().catch((err) => console.error('[storage] Failed to ensure bucket:', err));
startVideoWorker();
startBudgetResetCron();

const PORT = Number(process.env.API_PORT) || 3000;
server.listen(PORT, () => {
  console.info(`[api] Listening on http://localhost:${PORT}`);
});
