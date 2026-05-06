import { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateTransactionRequestDto,
  TransactionParamsDto,
  UpdateTransactionRequestDto,
} from "@application/dto/transaction/index.js";
import { createBalanceUseCases, createTransactionUseCases } from "@application/use-cases/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { ExpenseRepository } from "@/adapters/database/repositories/expenseRepository.js";
import { IncomeRepository } from "@adapters/database/repositories/incomeRepository.js";
import { BalanceRepository } from "@adapters/database/repositories/balanceRepository";
import { TransactionRepository } from "@adapters/database/repositories/transactionRepository.js";

const balanceUseCases = createBalanceUseCases({
  balanceRepository: new BalanceRepository(),
  transactionRepository: TransactionRepository,
  incomeRepository: IncomeRepository,
  expenseRepository: ExpenseRepository,
});

const transactionUseCases = createTransactionUseCases({
  transactionRepository: TransactionRepository,
  recalculateBalance: async (userId: string) => {
    const result = await balanceUseCases.recalculateBalance(userId);
    return result.balance;
  },
});

function sendFastifyError(reply: FastifyReply, error: unknown) {
  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }

  return reply.status(500).send({ error: "Erro interno inesperado." });
}

export async function createTransactionFastify(
  request: FastifyRequest<{ Body: CreateTransactionRequestDto }>,
  reply: FastifyReply
) {
  try {
    const data = request.validatedTransaction;

    if (!data) {
      return reply.status(400).send({ error: "Transação inválida." });
    }

    const result = await transactionUseCases.addTransaction(
      data.userId,
      data.description,
      data.amount,
      data.date,
      data.type
    );

    return reply.status(201).send(result);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function updateTransactionFastify(
  request: FastifyRequest<{
    Params: TransactionParamsDto;
    Body: UpdateTransactionRequestDto;
  }>,
  reply: FastifyReply
) {
  try {
    const transactionId = request.params.id;
    const userId = request.user?.userId;

    if (!transactionId) {
      return reply.status(400).send({ error: "Transação não encontrada." });
    }

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const data = request.validatedTransaction;

    if (!data) {
      return reply.status(400).send({ error: "TransaÃ§Ã£o invÃ¡lida." });
    }

    const updatedTransaction = await transactionUseCases.updateTransaction(
      transactionId,
      userId,
      data.description,
      data.amount,
      data.date,
      data.type
    );

    return reply.status(200).send(updatedTransaction);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function deleteTransactionFastify(
  request: FastifyRequest<{ Params: TransactionParamsDto }>,
  reply: FastifyReply
) {
  try {
    const transactionId = request.params.id;
    const userId = request.user?.userId;

    if (!transactionId) {
      return reply.status(400).send({ error: "Transação não encontrada." });
    }

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const removedTransaction = await transactionUseCases.removeTransaction(
      transactionId,
      userId
    );
    return reply.status(200).send(removedTransaction);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
