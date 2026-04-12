import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { listRewards, redeemReward } from '../services/rewards.service';

export const rewardsRouter = Router();

rewardsRouter.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const rewards = await listRewards();
  res.json(rewards);
});

rewardsRouter.post('/:id/redeem', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const redemption = await redeemReward(req.userId!, req.params.id);
    res.status(201).json(redemption);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'DUPLICATE_REQUEST') {
      res.status(409).json({ error: 'Duplicate redemption request, please wait a moment' });
    } else if (message === 'INSUFFICIENT_BALANCE') {
      res.status(402).json({ error: 'Insufficient balance' });
    } else if (message === 'OUT_OF_STOCK') {
      res.status(409).json({ error: 'This reward is out of stock' });
    } else {
      res.status(400).json({ error: message });
    }
  }
});
