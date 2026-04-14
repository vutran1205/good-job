import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { uploadBuffer } from '../lib/storage';

export const reactionsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const allowedExt = /^(jpeg|jpg|png|gif|webp|mp4|mov|webm)$/;
    const allowedMime = /^(image|video)\//;
    cb(null, allowedExt.test(ext) && allowedMime.test(file.mimetype));
  },
});

const reactionSchema = z.object({ emoji: z.string().min(1).max(10) });
const commentSchema = z.object({
  text: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).max(2000).optional(),
  ),
  mediaUrl: z.string().url().optional(),
});

reactionsRouter.post('/:id/reactions', authMiddleware, async (req: AuthRequest, res: Response) => {
  const result = reactionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  try {
    const where = {
      kudoId_userId_emoji: {
        kudoId: req.params.id,
        userId: req.userId!,
        emoji: result.data.emoji,
      },
    };

    const existing = await prisma.reaction.findUnique({
      where,
      include: { user: { select: { id: true, name: true } } },
    });

    if (existing) {
      const reaction = await prisma.reaction.delete({
        where,
        include: { user: { select: { id: true, name: true } } },
      });

      await redis.publish(
        'kudo:reaction',
        JSON.stringify({ kudoId: req.params.id, action: 'removed', reaction }),
      );
      res.json({ action: 'removed', reaction });
      return;
    }

    const reaction = await prisma.reaction.create({
      data: { kudoId: req.params.id, userId: req.userId!, emoji: result.data.emoji },
      include: { user: { select: { id: true, name: true } } },
    });

    await redis.publish(
      'kudo:reaction',
      JSON.stringify({ kudoId: req.params.id, action: 'added', reaction }),
    );
    res.status(201).json({ action: 'added', reaction });
  } catch {
    res.status(404).json({ error: 'Kudo not found' });
  }
});

reactionsRouter.post(
  '/comments/:id/reactions',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const result = reactionSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten() });
      return;
    }

    try {
      const where = {
        commentId_userId_emoji: {
          commentId: req.params.id,
          userId: req.userId!,
          emoji: result.data.emoji,
        },
      };

      const existing = await prisma.commentReaction.findUnique({
        where,
        include: {
          user: { select: { id: true, name: true } },
          comment: { select: { kudoId: true } },
        },
      });

      if (existing) {
        const reaction = await prisma.commentReaction.delete({
          where,
          include: {
            user: { select: { id: true, name: true } },
            comment: { select: { kudoId: true } },
          },
        });

        await redis.publish(
          'comment:reaction',
          JSON.stringify({
            kudoId: reaction.comment.kudoId,
            commentId: req.params.id,
            action: 'removed',
            reaction,
          }),
        );
        res.json({ action: 'removed', reaction });
        return;
      }

      const reaction = await prisma.commentReaction.create({
        data: { commentId: req.params.id, userId: req.userId!, emoji: result.data.emoji },
        include: {
          user: { select: { id: true, name: true } },
          comment: { select: { kudoId: true } },
        },
      });

      await redis.publish(
        'comment:reaction',
        JSON.stringify({
          kudoId: reaction.comment.kudoId,
          commentId: req.params.id,
          action: 'added',
          reaction,
        }),
      );
      res.status(201).json({ action: 'added', reaction });
    } catch {
      res.status(404).json({ error: 'Comment not found' });
    }
  },
);

reactionsRouter.post(
  '/:id/comments',
  authMiddleware,
  upload.single('media'),
  async (req: AuthRequest, res: Response) => {
    const result = commentSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten() });
      return;
    }

    const file = req.file as Express.Multer.File | undefined;

    if (!result.data.text && !result.data.mediaUrl && !file) {
      res.status(400).json({ error: 'Comment must have text or media' });
      return;
    }

    try {
      let mediaUrl = result.data.mediaUrl;

      if (file) {
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        const key = `media/comments/${crypto.randomUUID()}.${ext}`;
        mediaUrl = await uploadBuffer(key, file.buffer, file.mimetype);
      }

      const comment = await prisma.comment.create({
        data: {
          kudoId: req.params.id,
          userId: req.userId!,
          text: result.data.text,
          mediaUrl,
        },
        include: {
          user: { select: { id: true, name: true } },
          reactions: { include: { user: { select: { id: true, name: true } } } },
        },
      });
      await redis.publish('kudo:comment', JSON.stringify({ kudoId: req.params.id, comment }));
      res.status(201).json(comment);
    } catch {
      res.status(404).json({ error: 'Kudo not found' });
    }
  },
);
