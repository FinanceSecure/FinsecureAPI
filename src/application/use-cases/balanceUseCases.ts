import { ITransactionRepository } from "../ports/repositories";
import { ValidationError } from "@application/errors";
import { ErroMessages } from "@domain/erros";

export function createBalanceUseCases(
  deps: {
    transactionRepository: ITransactionRepository;
  }
) {
  const {
    transactionRepository,
  } = deps;

  return {
    async recalculateBalance(
      userId: string
    ) {
      if (!userId?.trim())
        throw new ValidationError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      const balance =
        await transactionRepository.getTotalCompletedByUser(userId);

      return {
        message: "Saldo recalculado com sucesso.",
        balance: Number(balance || 0),
      };
    },

    async viewBalance(
      userId: string
    ) {
      if (!userId?.trim())
        throw new ValidationError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      const balance =
        await transactionRepository.getTotalCompletedByUser(
          userId
        );

      return {
        message:
          "Saldo localizado com sucesso.",
        balance:
          Number(balance || 0),
      };
    },
  };
}
