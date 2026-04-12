import { prisma } from '../lib/prisma';

export async function getBalance(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      receivedBalance: true,
      givingBudget: { select: { remaining: true, month: true } },
    },
  });
  return user;
}

export async function getLedger(userId: string) {
  return prisma.ledgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function resetMonthlyBudgets() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const result = await prisma.givingBudget.updateMany({
    where: { month: { not: currentMonth } },
    data: { month: currentMonth, remaining: 200 },
  });

  return result.count;
}
