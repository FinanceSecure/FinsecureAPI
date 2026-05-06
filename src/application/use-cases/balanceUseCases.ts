import {
  IExpenseRepository,
  IIncomeRepository,
  IBalanceRepository,
  ITransactionRepository,
} from "../ports/repositories";
import { ResourceNotFoundError, ValidationError } from "@application/errors";
import { ErroMessages } from "@domain/erros";

export function createBalanceUseCases(deps: {
  balanceRepository: IBalanceRepository;
  transactionRepository: ITransactionRepository;
  incomeRepository: IIncomeRepository;
  expenseRepository: IExpenseRepository;
}) {
  const {
    balanceRepository,
    transactionRepository,
    incomeRepository,
    expenseRepository,
  } = deps;

  return {
    async recalculateBalance(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const [
        totalTransactions,
        totalIncome,
        totalExpenses,
      ] = await Promise.all([
        transactionRepository.getTotalCompletedByUser(userId),
        incomeRepository.getTotalIncomeByUser(userId),
        expenseRepository.getTotalByUserId(userId),
      ]);

      const updatedBalance =
        Number(totalIncome || 0) +
        Number(totalTransactions || 0) -
        Number(totalExpenses || 0);

      const existingBalance =
        await balanceRepository.getBalanceByUserId(
          userId
        );

      if (existingBalance) {
        await balanceRepository.updateBalance(
          existingBalance.id,
          updatedBalance
        );
      } else {
        await balanceRepository.createBalance(
          userId,
          updatedBalance
        );
      }

      return {
        message: "Saldo recalculado com sucesso.",
        balance: updatedBalance,
      };
    },

    async viewBalance(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const balance =
        await balanceRepository.getBalanceByUserId(
          userId
        );

      if (!balance) {
        return {
          message: "Saldo localizado com sucesso.",
          balance: { id: null, userId, amount: 0, lastUpdate: new Date() },
        };
      }

      return {
        message: "Saldo localizado com sucesso.",
        balance: balance,
      };
    },

    async initializeBalance(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const existingBalance =
        await balanceRepository.getBalanceByUserId(
          userId
        );

      if (existingBalance) {
        return {
          message: "Saldo já existente.",
          balance: existingBalance,
        };
      }

      const newBalance =
        await balanceRepository.createBalance(
          userId,
          0
        );

      return {
        message: "Saldo inicial criado com sucesso.",
        balance: newBalance,
      };
    },

    async removeBalance(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const existingBalance =
        await balanceRepository.getBalanceByUserId(
          userId
        );

      if (!existingBalance) {
        throw new ResourceNotFoundError(
          ErroMessages.SALDO.NAO_ENCONTRADO
        );
      }

      return {
        message: "Saldo removido com sucesso.",
      };
    },
  };
}
