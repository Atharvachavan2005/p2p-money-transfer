import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const executeTransfer = async (senderId: string, receiverId: string, amount: number) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Deduct from sender
    const sender = await tx.user.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } }
    });

    // 2. Safety check: Can't have negative balance
    if (sender.balance.lt(0)) throw new Error("Insufficient funds");

    // 3. Add to receiver
    await tx.user.update({
      where: { id: receiverId },
      data: { balance: { increment: amount } }
    });

    // 4. Create Transaction record
    return await tx.transaction.create({
      data: { senderId, receiverId, amount, status: 'SUCCESS' }
    });
  });
};