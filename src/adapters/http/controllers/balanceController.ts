import { FastifyReply, FastifyRequest } from "fastify";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { createBalanceUseCases } from "@application/use-cases/index.js";
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

function sendFastifyError(reply: FastifyReply, error: unknown) {
  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }

  return reply.status(500).send({ error: "Erro interno inesperado." });
}

export async function getBalanceFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const balance = await balanceUseCases.viewBalance(userId);
    return reply.status(200).send(balance);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
