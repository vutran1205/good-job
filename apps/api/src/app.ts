import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth';
import { kudosRouter } from './routes/kudos';
import { reactionsRouter } from './routes/reactions';
import { rewardsRouter } from './routes/rewards';
import { usersRouter } from './routes/users';
import { streamObject, BUCKET } from './lib/storage';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.use(
    '/api',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }),
  );

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Proxy media files from internal MinIO — path: /media/:bucket/:key(*)
  app.get(`/media/${BUCKET}/*`, async (req: Request, res: Response) => {
    const key = req.params[0];
    try {
      const { body, contentType } = await streamObject(key);
      if (contentType) res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      body.pipe(res);
    } catch {
      res.status(404).json({ error: 'Media not found' });
    }
  });

  app.use('/api/auth', authRouter);
  app.use('/api/kudos', kudosRouter);
  app.use('/api/kudos', reactionsRouter);
  app.use('/api/rewards', rewardsRouter);
  app.use('/api/users', usersRouter);

  return app;
}
