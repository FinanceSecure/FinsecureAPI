import prisma from "../db.js";
import { IIncomeRepository } from "@/application/ports/repositories";

export const IncomeRepository: IIncomeRepository = {
  listFixedIncome(userId) {
    return prisma.fixedIncome.findMany({ where: { userId } });
  },

  getFixedIncome(userId) {
    return prisma.fixedIncome.findUnique({ where: { userId } });
  },

  createFixedIncome(userId, amount) {
    return prisma.fixedIncome.create({
      data: { userId, amount },
    });
  },

  updateFixedIncome(userId, amount) {
    return prisma.fixedIncome.update({
      where: { userId },
      data: { amount },
    });
  },

  removeFixedIncome(userId) {
    return prisma.fixedIncome.delete({ where: { userId } });
  },

  listVariableIncome(userId) {
    return prisma.variableIncome.findMany({ where: { userId } });
  },

  getVariableIncomeById(id) {
    return prisma.variableIncome.findUnique({ where: { id } });
  },

  createVariableIncome(data) {
    return prisma.variableIncome.create({
      data: {
        userId: data.userId,
        description: data.description,
        amount: data.amount,
      }
    });
  },

  updateVariableIncome(data) {
    return prisma.variableIncome.update({
      where: { id: data.id },
      data: {
        description: data.description,
        amount: data.amount,
      },
    });
  },

  removeVariableIncome(id) {
    return prisma.variableIncome.delete({ where: { id } });
  },

  async getTotalIncomeByUser(userId) {
    const fixedIncome = await prisma.fixedIncome.findMany({
      where: { userId },
    });
    const variableIncome = await prisma.variableIncome.findMany({
      where: { userId },
    });

    const totalFixedIncome = fixedIncome.reduce(
      (total, income) => total + income.amount,
      0
    );
    const totalVariableIncome = variableIncome.reduce(
      (total, income) => total + income.amount,
      0
    );

    return totalFixedIncome + totalVariableIncome;
  },
};
