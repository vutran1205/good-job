import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { giveKudo, getKudosFeed } from '../services/kudos.service';
import { videoQueue } from '../jobs/video.worker';
import { prisma } from '../lib/prisma';
import { uploadBuffer } from '../lib/storage';

export const kudosRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    cb(null, allowed.test(ext));
  },
});

const giveKudoSchema = z.object({
  recipientId: z.string().min(1),
  points: z.coerce.number().int().min(10).max(50),
  description: z.string().min(1).max(1000),
  tag: z.string().min(1),
});

kudosRouter.post(
  '/',
  authMiddleware,
  upload.array('media', 3),
  async (req: AuthRequest, res: Response) => {
    const result = giveKudoSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten() });
      return;
    }

    const { recipientId, points, description, tag } = result.data;

    try {
      const kudo = await giveKudo(req.userId!, recipientId, points, description, tag);

      const files = (req.files as Express.Multer.File[]) || [];
      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        const isVideo = /mp4|mov|webm/.test(ext);
        const key = `media/${crypto.randomUUID()}.${ext}`;
        const url = await uploadBuffer(key, file.buffer, file.mimetype);

        const media = await prisma.kudoMedia.create({
          data: {
            kudoId: kudo.id,
            type: isVideo ? 'video' : 'image',
            url,
            status: isVideo ? 'pending' : 'ready',
          },
        });

        if (isVideo) {
          await videoQueue.add('transcode', { mediaId: media.id, originalUrl: url });
        }
      }

      res.status(201).json(kudo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },
);

kudosRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
  const limit = Number(req.query.limit) || 20;
  const feed = await getKudosFeed(cursor, limit);
  res.json(feed);
});
