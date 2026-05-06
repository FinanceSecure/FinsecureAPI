import { ValidationError } from "../errors/ApplicationError.js";
import { IIncomeRepository } from "../ports/repositories/index.js";

export function createIncomeUseCases(deps: {
  incomeRepository: IIncomeRepository;
  recalculateBalance: (userId: string) => Promise<number>;
}) {
  const { incomeRepository, recalculateBalance } = deps;

  return {
    async checkIncomes(userId: string) {
      const fixedIncome =
        await incomeRepository.listFixedIncome(userId);
      const variableIncome =
        await incomeRepository.listVariableIncome(userId);

      const totalFixedIncome = fixedIncome.reduce(
        (total, income) => total + income.amount,
        0
      );
      const totalVariableIncome = variableIncome.reduce(
        (total, income) => total + income.amount,
        0
      );

      return {
        rendaFixa: totalFixedIncome,
        rendaVariavel: totalVariableIncome,
        totalReceitas: totalFixedIncome + totalVariableIncome,
        detalhes: { rendaFixa: fixedIncome, outros: variableIncome },
      };
    },

    async checkFixedIncome(userId: string) {
      const fixedIncome = await incomeRepository.getFixedIncome(userId);
      return { rendaFixa: fixedIncome };
    },

    async addFixedIncome(data: { userId: string; amount: number }) {
      const newFixedIncome = await incomeRepository.createFixedIncome(
        data.userId,
        data.amount
      );
      await recalculateBalance(data.userId);
      return newFixedIncome;
    },

    async updateFixedIncome(data: { userId: string; amount: number }) {
      const income = await incomeRepository.getFixedIncome(data.userId);

      if (!income) {
        throw new ValidationError(
          "Renda fixa não encontrada para este usuário."
        );
      }

      const updatedFixedIncome =
        await incomeRepository.updateFixedIncome(
          data.userId,
          data.amount
        );

      await recalculateBalance(data.userId);
      return updatedFixedIncome;
    },

    async removeFixedIncome(userId: string) {
      const removedFixedIncome =
        await incomeRepository.removeFixedIncome(userId);

      await recalculateBalance(userId);
      return removedFixedIncome;
    },

    async checkVariableIncome(userId: string) {
      const variableIncome =
        await incomeRepository.listVariableIncome(userId);

      return { rendaVariavel: variableIncome };
    },

    async addVariableIncome(data: {
      userId: string;
      description: string;
      amount: number;
    }) {
      const newVariableIncome =
        await incomeRepository.createVariableIncome(data);

      await recalculateBalance(data.userId);
      return newVariableIncome;
    },

    async updateVariableIncome(data: {
      id: string;
      description?: string;
      amount?: number;
    }) {
      if (!data.id) {
        throw new ValidationError("ID não informado.");
      }

      const existing =
        await incomeRepository.getVariableIncomeById(data.id);

      if (!existing) {
        throw new ValidationError("Investimento não encontrado.");
      }

      const updatedVariableIncome =
        await incomeRepository.updateVariableIncome(data);

      await recalculateBalance(existing.userId);
      return updatedVariableIncome;
    },

    async removeVariableIncome(id: string) {
      const existing =
        await incomeRepository.getVariableIncomeById(id);

      if (!existing) {
        throw new ValidationError("Investimento não encontrado.");
      }

      const removedVariableIncome =
        await incomeRepository.removeVariableIncome(id);

      await recalculateBalance(existing.userId);
      return removedVariableIncome;
    },
  };
}
