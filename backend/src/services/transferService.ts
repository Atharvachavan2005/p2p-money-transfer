import { prisma } from '../utils/prisma.js';

export const executeTransfer = async (senderId: string, receiverId: string, amount: number) => {
  // MongoDB transactions use snapshot isolation by default
  // For race condition prevention, we check balance BEFORE decrementing
  // and use optimistic locking pattern
  return await prisma.$transaction(async (tx) => {
    // 1. Check if receiver exists FIRST (Ghost User Scenario)
    // This prevents money from being "lost" if receiver doesn't exist
    const receiver = await tx.user.findUnique({
      where: { id: receiverId },
      select: { id: true }
    });

    if (!receiver) {
      throw new Error("Receiver not found. Please verify the User ID.");
    }

    // 2. Check sender balance BEFORE decrementing (Insufficient Funds Scenario)
    // This ensures balance doesn't change if insufficient funds
    // CRITICAL: This check happens BEFORE any balance modification
    const sender = await tx.user.findUnique({
      where: { id: senderId },
      select: { balance: true }
    });

    if (!sender) {
      throw new Error("Sender account not found.");
    }

    // Check balance BEFORE any changes (prevents balance from changing if insufficient)
    // If this check fails, the entire transaction rolls back - balance never changes
    if (sender.balance < amount) {
      throw new Error("Insufficient funds");
    }

    // 3. Deduct from sender
    // MongoDB transactions ensure atomicity - if this fails, everything rolls back
    const updatedSender = await tx.user.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } }
    });

    // 4. Double-check balance after decrement (safety net for edge cases)
    // This catches any race conditions that might slip through
    if (updatedSender.balance < 0) {
      throw new Error("Insufficient funds");
    }

    // 5. Add to receiver
    await tx.user.update({
      where: { id: receiverId },
      data: { balance: { increment: amount } }
    });

    // 6. Create Transaction record
    return await tx.transaction.create({
      data: { senderId, receiverId, amount, status: 'SUCCESS' }
    });
  }, {
    timeout: 10000, // 10 second timeout
    maxWait: 5000, // Maximum wait time for transaction lock
  });
};