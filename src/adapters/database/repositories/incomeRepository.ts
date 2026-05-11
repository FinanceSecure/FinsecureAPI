import prisma from "../db.js";

import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

import { IIncomeRepository } from "@/application/ports/repositories";

export const IncomeRepository: IIncomeRepository = {
  async listFixedIncome(userId) {
    return prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.INCOME,

        category: {
          in: [
            TransactionCategory.SALARY,
          ],
        },

        deletedAt: null,
      },
    });
  },

  async getFixedIncome(userId) {
    return prisma.transaction.findFirst({
      where: {
        userId,
        type: TransactionType.INCOME,

        category:
          TransactionCategory.SALARY,

        deletedAt: null,
      },
    });
  },

  async createFixedIncome(
    userId,
    amount
  ) {
    return prisma.transaction.create({
      data: {
        title: "Salário",
        userId,
        amount,
        description: "Renda fixa",
        type: TransactionType.INCOME,
        category: TransactionCategory.SALARY,
        status: TransactionStatus.COMPLETED,
      },
    });
  },

  async updateFixedIncome(
    userId,
    amount
  ) {
    const fixedIncome =
      await prisma.transaction.findFirst({
        where: {
          userId,
          type: TransactionType.INCOME,
          category: TransactionCategory.SALARY,
          deletedAt: null,
        },
      });

    if (!fixedIncome)
      throw new Error("Renda fixa não encontrada.");

    return prisma.transaction.update({
      where: {
        id: fixedIncome.id,
      },

      data: {
        amount,
      },
    });
  },

  async removeFixedIncome(userId) {
    const fixedIncome =
      await prisma.transaction.findFirst({
        where: {
          userId,
          type: TransactionType.INCOME,
          category: TransactionCategory.SALARY,
          deletedAt: null,
        },
      });

    if (!fixedIncome)
      throw new Error("Renda fixa não encontrada.");

    return prisma.transaction.delete({
      where: {
        id: fixedIncome.id,
      },
    });
  },

  async listVariableIncome(userId) {
    return prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.INCOME,
        category: {
          in: [
            TransactionCategory.FREELANCE,
            TransactionCategory.BONUS,
            TransactionCategory.CASHBACK,
            TransactionCategory.DIVIDENDS,
          ],
        },
        deletedAt: null,
      },
    });
  },

  async getVariableIncomeById(id) {
    return prisma.transaction.findUnique({
      where: {
        id,
      },
    });
  },

  async createVariableIncome(
    data
  ) {
    return prisma.transaction.create({
      data: {
        title: data.title,
        userId: data.userId,
        description: data.description,
        amount: data.amount,
        type: TransactionType.INCOME,
        category: TransactionCategory.FREELANCE,
        status: TransactionStatus.COMPLETED,
      },
    });
  },

  async updateVariableIncome(
    data
  ) {
    return prisma.transaction.update({
      where: {
        id: data.id,
      },
      data: {
        description: data.description,
        amount: data.amount,
      },
    });
  },

  async removeVariableIncome(id) {
    return prisma.transaction.delete({
      where: { id },
    });
  },

  async getTotalIncomeByUser(
    userId
  ) {
    const incomes =
      await prisma.transaction.findMany({
        where: {
          userId,
          type: TransactionType.INCOME,
          status: TransactionStatus.COMPLETED,
          deletedAt: null,
        },
      });

    return incomes.reduce(
      (total, income) =>
        total + income.amount,
      0
    );
  },
};
