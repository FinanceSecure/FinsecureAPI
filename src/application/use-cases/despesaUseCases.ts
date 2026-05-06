import { calcTotalExpenses } from "../../shared/utils/calcDespesas.js";
import { IExpenseRepository } from "../ports/repositories";

export function criarDespesaUseCases(deps: {
  expenseRepository: IExpenseRepository;
  recalcBalance: (userId: string) => Promise<number>;
}) {
  const { expenseRepository, recalcBalance } = deps;

  return {
    listarDespesas(userId: string) {
      return expenseRepository.listByUserId(userId);
    },

    async criarDespesa(expenseData: {
      amount: number;
      dueDate: Date | null;
      category: string;
      description: string;
      scheduledAt?: Date | null;
      userId: string;
    }) {
      const expense = await expenseRepository.create(expenseData);
      await recalcBalance(expenseData.userId);
      return expense;
    },

    listarDespesasAgendadas(userId: string) {
      return expenseRepository.listScheduled(userId);
    },

    async verificarTotalDespesas(userId: string) {
      const expenses = await expenseRepository.listByUserId(userId);
      const totalDespesas = calcTotalExpenses(expenses);

      return {
        totalDespesas,
        detalhes: { expenses },
      };
    },
  };
}
