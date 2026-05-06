import { TransactionType } from "@prisma/client";
import { ValidationError } from "../errors/ApplicationError.js";
import { ITransactionRepository } from "../ports/repositories";

type TransactionUseCasesDeps = {
  transactionRepository: ITransactionRepository;
  recalculateBalance: (userId: string) => Promise<number>;
};

export function createTransactionUseCases({
  transactionRepository,
  recalculateBalance,
}: TransactionUseCasesDeps) {
  if (!transactionRepository)
    throw new Error("TransactionRepository é obrigatório");

  if (!recalculateBalance)
    throw new Error("recalculateBalance é obrigatório");

  return {
    async addTransaction(
      userId: string,
      description: string,
      value: number,
      date: Date,
      type: TransactionType
    ) {
      if (!userId)
        throw new ValidationError("Usuário não autenticado");

      if (!description || description.trim().length === 0)
        throw new ValidationError("A descrição é obrigatória");

      if (value === undefined || value === null)
        throw new ValidationError("O valor é obrigatório");

      if (!(date instanceof Date) || isNaN(date.getTime()))
        throw new ValidationError("Data inválida");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const transactionDate = new Date(date);
      transactionDate.setHours(0, 0, 0, 0);

      const status =
        transactionDate <= today
          ? "COMPLETED"
          : "PENDING";

      const transaction = await transactionRepository.create({
        userId,
        description,
        amount: value,
        date,
        type,
        status,
      });

      const currentBalance = await recalculateBalance(userId);

      return {
        transaction,
        currentBalance,
      };
    },

    async updateTransaction(
      id: string,
      userId: string,
      description: string,
      value: number,
      date: Date,
      type: TransactionType
    ) {
      if (!id)
        throw new ValidationError("ID da transação inválido");

      if (!userId)
        throw new ValidationError("Usuário não autenticado");

      if (value === undefined)
        throw new ValidationError("Valor inválido");

      const existingTransaction =
        await transactionRepository.findByIdAndUserId(id, userId);
      if (!existingTransaction)
        throw new ValidationError(
          "Transação não encontrada ou não pertence a este usuário"
        );

      const updatedTransaction =
        await transactionRepository.update(id, {
          description,
          amount: value,
          date,
          type,
        });

      await recalculateBalance(userId);

      return updatedTransaction;
    },

    async removeTransaction(
      id: string,
      userId: string
    ) {
      if (!id)
        throw new ValidationError("ID da transação inválido");

      if (!userId)
        throw new ValidationError("Usuário não autenticado");

      const transaction =
        await transactionRepository.findByIdAndUserId(id, userId);
      if (!transaction)
        throw new ValidationError(
          "Transação não encontrada ou não pertence a este usuário"
        );

      const removedTransaction =
        await transactionRepository.remove(id);

      await recalculateBalance(userId);

      return removedTransaction;
    },

    async releasePendingTransactions() {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const pendingTransactions =
        await transactionRepository.listPendingUntil(today);

      for (const transaction of pendingTransactions) {
        await transactionRepository.updateStatus(
          transaction.id,
          "COMPLETED"
        );

        await recalculateBalance(transaction.userId);
      }
    },
  };
}
