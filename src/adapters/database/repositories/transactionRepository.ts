import prisma from "../db.js";
import { ITransactionRepository } from "@/application/ports/repositories";

export const TransactionRepository: ITransactionRepository = {
  create(data) {
    return prisma.transaction.create({ data });
  },

  findByIdAndUserId(id, userId) {
    return prisma.transaction.findFirst({
      where: { id, userId },
    });
  },

  update(id, data) {
    return prisma.transaction.update({
      where: { id },
      data,
    });
  },

  remove(id) {
    return prisma.transaction.delete({ where: { id } });
  },

  listPendingUntil(deadline) {
    return prisma.transaction.findMany({
      where: {
        status: "PENDING",
        date: { lte: deadline },
      },
    });
  },

  async updateStatus(id, status) {
    await prisma.transaction.update({
      where: { id },
      data: { status },
    });
  },

  async getTotalCompletedByUser(userId) {
    const totalTransactions = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, status: "COMPLETED" },
    });

    return totalTransactions._sum.amount || 0;
  },
};
