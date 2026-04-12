/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rewards = [
  {
    name: 'Coffee Voucher',
    pointCost: 100,
    description: 'A free coffee at any café near the office',
    stock: null, // unlimited
  },
  {
    name: 'Company Hoodie',
    pointCost: 500,
    description: 'Amanotes branded hoodie — pick your size',
    stock: 20,
  },
  {
    name: 'Team Lunch',
    pointCost: 800,
    description: 'Company-sponsored lunch for you and your team',
    stock: 10,
  },
  {
    name: 'Friday Afternoon Off',
    pointCost: 1000,
    description: 'Leave early on a Friday of your choice',
    stock: 5,
  },
  {
    name: 'Amazon Gift Card $20',
    pointCost: 1500,
    description: '$20 Amazon gift card delivered to your email',
    stock: 8,
  },
];

async function main() {
  const existing = await prisma.rewardItem.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} reward(s) already exist.`);
    return;
  }

  const result = await prisma.rewardItem.createMany({ data: rewards });
  console.log(`Seeded ${result.count} rewards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
