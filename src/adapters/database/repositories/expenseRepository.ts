import prisma from "../db.js";

import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

import { IExpenseRepository } from "@/application/ports/repositories";

export const ExpenseRepository: IExpenseRepository = {
  async getTotalByUserId(userId) {
    const expenses =
      await prisma.transaction.findMany({
        where: {
          userId,

          type:
            TransactionType.EXPENSE,

          status:
            TransactionStatus.COMPLETED,

          deletedAt: null,
        },
      });

    return expenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );
  },

  async listByUserId(userId) {
    return prisma.transaction.findMany({
      where: {
        userId,

        type:
          TransactionType.EXPENSE,

        deletedAt: null,
      },
    });
  },

  async create(data) {
    return prisma.transaction.create({
      data: {
        userId: data.userId,

        description:
          data.description,

        amount: data.amount,

        type:
          TransactionType.EXPENSE,

        category:
          data.category ??
          TransactionCategory.OTHER,

        status:
          TransactionStatus.COMPLETED,
      },
    });
  },

  async update(id, data) {
    return prisma.transaction.update({
      where: {
        id,
      },

      data: {
        description:
          data.description,

        amount:
          data.amount,

        category:
          data.category,
      },
    });
  },

  async remove(id) {
    return prisma.transaction.delete({
      where: {
        id,
      },
    });
  },
};
