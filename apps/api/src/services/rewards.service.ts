import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export async function listRewards() {
  return prisma.rewardItem.findMany({ orderBy: { pointCost: 'asc' } });
}

export async function redeemReward(userId: string, rewardItemId: string) {
  const minuteKey = new Date().toISOString().slice(0, 16).replace('T', ':');
  const idempotencyKey = `redeem:${userId}:${rewardItemId}:${minuteKey}`;

  const acquired = await redis.set(idempotencyKey, '1', 'EX', 60, 'NX');
  if (!acquired) {
    throw new Error('DUPLICATE_REQUEST');
  }

  try {
    const redemption = await prisma.$transaction(async (tx) => {
      const reward = await tx.$queryRaw<{ id: string; pointCost: number; stock: number | null }[]>`
        SELECT id, "pointCost", stock FROM "RewardItem"
        WHERE id = ${rewardItemId}
        FOR UPDATE
      `;

      if (!reward.length) throw new Error('Reward not found');

      const { pointCost, stock } = reward[0];

      if (stock !== null && stock <= 0) {
        throw new Error('OUT_OF_STOCK');
      }

      const user = await tx.$queryRaw<{ id: string; receivedBalance: number }[]>`
        SELECT id, "receivedBalance" FROM "User"
        WHERE id = ${userId}
        FOR UPDATE
      `;

      if (!user.length || user[0].receivedBalance < pointCost) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      await tx.user.update({
        where: { id: userId },
        data: { receivedBalance: { decrement: pointCost } },
      });

      if (stock !== null) {
        await tx.rewardItem.update({
          where: { id: rewardItemId },
          data: { stock: { decrement: 1 } },
        });
      }

      const newRedemption = await tx.redemption.create({
        data: { userId, rewardItemId, status: 'pending' },
        include: { rewardItem: true },
      });

      await tx.ledgerEntry.create({
        data: {
          userId,
          delta: -pointCost,
          reason: 'redemption',
          refId: newRedemption.id,
        },
      });

      return newRedemption;
    });

    return redemption;
  } catch (err) {
    await redis.del(idempotencyKey);
    throw err;
  }
}
