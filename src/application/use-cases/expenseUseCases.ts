import { calcTotalExpenses } from "../../shared/utils/calcDespesas.js";
import { IExpenseRepository } from "../ports/repositories/";

export function createExpenseUseCases(deps: {
  expenseRepository: IExpenseRepository;
  recalculateBalance: (userId: string) => Promise<number>;
}) {
  const { expenseRepository, recalculateBalance } = deps;

  return {
    listExpenses(userId: string) {
      return expenseRepository.listByUserId(userId);
    },

    async createExpense(expenseData: {
      amount: number;
      dueDate: Date | null;
      category: string;
      description: string;
      scheduledAt?: Date | null;
      userId: string;
    }) {
      const expense = await expenseRepository.create(expenseData);
      await recalculateBalance(expenseData.userId);
      return expense;
    },

    listScheduledExpenses(userId: string) {
      return expenseRepository.listScheduled(userId);
    },

    async verifyTotalExpenses(userId: string) {
      const expenses = await expenseRepository.listByUserId(userId);
      const totalExpensesValue = calcTotalExpenses(expenses);

      return {
        totalExpenses: totalExpensesValue,
        details: { expenses },
      };
    },
  };
}
