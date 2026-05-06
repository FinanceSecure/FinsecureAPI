import prisma from "../db.js";
import { IExpenseRepository } from "@/application/ports/repositories/IExpenseRepository.js";

export const ExpenseRepository: IExpenseRepository = {
  listByUserId(userId) {
    return prisma.expense.findMany({
      where: { userId },
      orderBy: { dueDate: "desc" },
    });
  },

  listScheduled(userId) {
    return prisma.expense.findMany({
      where: {
        userId,
        dueDate: {
          gte: new Date(),
        },
      },
    });
  },

  create(data) {
    return prisma.expense.create({ data });
  },

  async getTotalByUserId(userId) {
    const expenses = await prisma.expense.findMany({ where: { userId } });
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  },
};
