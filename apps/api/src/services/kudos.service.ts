import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const CORE_VALUE_TAGS = ['#Teamwork', '#Ownership', '#Innovation', '#CustomerFirst', '#Integrity'];

export function isValidTag(tag: string) {
  return CORE_VALUE_TAGS.includes(tag);
}

export async function giveKudo(
  senderId: string,
  recipientId: string,
  points: number,
  description: string,
  tag: string,
) {
  if (senderId === recipientId) {
    throw new Error('Cannot send a kudo to yourself');
  }
  if (points < 10 || points > 50) {
    throw new Error('Points must be between 10 and 50');
  }
  if (!isValidTag(tag)) {
    throw new Error(`Invalid tag. Must be one of: ${CORE_VALUE_TAGS.join(', ')}`);
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const kudo = await prisma.$transaction(async (tx) => {
    const budget = await tx.$queryRaw<{ id: string; remaining: number }[]>`
      SELECT id, remaining FROM "GivingBudget"
      WHERE "userId" = ${senderId} AND month = ${currentMonth}
      FOR UPDATE
    `;

    if (!budget.length || budget[0].remaining < points) {
      throw new Error('Insufficient giving budget');
    }

    await tx.givingBudget.update({
      where: { id: budget[0].id },
      data: { remaining: { decrement: points } },
    });

    const newKudo = await tx.kudo.create({
      data: { senderId, recipientId, points, description, tag },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
    });

    await tx.user.update({
      where: { id: recipientId },
      data: { receivedBalance: { increment: points } },
    });

    await tx.ledgerEntry.createMany({
      data: [
        { userId: recipientId, delta: points,  reason: 'kudo_received', refId: newKudo.id },
        { userId: senderId,    delta: -points, reason: 'kudo_sent',     refId: newKudo.id },
      ],
    });

    return newKudo;
  });

  await redis.publish('kudo:created', JSON.stringify(kudo));
  return kudo;
}

export async function getKudosFeed(cursor?: string, limit = 20) {
  const kudos = await prisma.kudo.findMany({
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
      media: true,
      reactions: { include: { user: { select: { id: true, name: true } } } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const hasNextPage = kudos.length > limit;
  const items = hasNextPage ? kudos.slice(0, -1) : kudos;
  const nextCursor = hasNextPage ? items[items.length - 1].id : null;

  return { items, nextCursor };
}
