import {
  IExpenseRepository,
  IIncomeRepository,
  ITransactionRepository,
} from "../ports/repositories";
import { ValidationError } from "@application/errors";
import { ErroMessages } from "@domain/erros";

export function createBalanceUseCases(deps: {
  transactionRepository: ITransactionRepository;
  expenseRepository: IExpenseRepository;
}) {
  const {
    transactionRepository,
    expenseRepository,
  } = deps;

  return {
    async recalculateBalance(
      userId: string
    ) {
      if (!userId?.trim())
        throw new ValidationError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      const [
        totalTransactions,
        totalExpenses,
      ] = await Promise.all([
        transactionRepository.getTotalCompletedByUser(userId),
        expenseRepository.getTotalByUserId(userId),
      ]);

      const balance =
        Number(totalTransactions || 0) -
        Number(totalExpenses || 0);

      return {
        message: "Saldo recalculado com sucesso.",
        balance,
      };
    },

    async viewBalance(userId: string) {
      if (!userId?.trim())
        throw new ValidationError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      const [
        totalTransactions,
        totalExpenses,
      ] = await Promise.all([
        transactionRepository.getTotalCompletedByUser(userId),
        expenseRepository.getTotalByUserId(userId),
      ]);

      const balance =
        Number(totalTransactions || 0) -
        Number(totalExpenses || 0);

      return {
        message: "Saldo localizado com sucesso.",
        balance,
      };
    },
  };
}
