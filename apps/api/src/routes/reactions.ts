import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export const reactionsRouter = Router();

const reactionSchema = z.object({ emoji: z.string().min(1).max(10) });
const commentSchema = z.object({
  text: z.string().min(1).max(2000).optional(),
  mediaUrl: z.string().url().optional(),
});

reactionsRouter.post('/:id/reactions', authMiddleware, async (req: AuthRequest, res: Response) => {
  const result = reactionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  try {
    const reaction = await prisma.reaction.upsert({
      where: { kudoId_userId_emoji: { kudoId: req.params.id, userId: req.userId!, emoji: result.data.emoji } },
      create: { kudoId: req.params.id, userId: req.userId!, emoji: result.data.emoji },
      update: {},
      include: { user: { select: { id: true, name: true } } },
    });
    await redis.publish('kudo:reaction', JSON.stringify({ kudoId: req.params.id, reaction }));
    res.status(201).json(reaction);
  } catch {
    res.status(404).json({ error: 'Kudo not found' });
  }
});

reactionsRouter.post('/:id/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
  const result = commentSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  if (!result.data.text && !result.data.mediaUrl) {
    res.status(400).json({ error: 'Comment must have text or mediaUrl' });
    return;
  }

  try {
    const comment = await prisma.comment.create({
      data: { kudoId: req.params.id, userId: req.userId!, ...result.data },
      include: { user: { select: { id: true, name: true } } },
    });
    await redis.publish('kudo:comment', JSON.stringify({ kudoId: req.params.id, comment }));
    res.status(201).json(comment);
  } catch {
    res.status(404).json({ error: 'Kudo not found' });
  }
});
