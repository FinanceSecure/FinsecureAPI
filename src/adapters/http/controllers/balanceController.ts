import { FastifyReply, FastifyRequest } from "fastify";
import { createBalanceUseCases } from "@application/use-cases";
import {
  ExpenseRepository,
  IncomeRepository,
  InvestmentRepository,
  TransactionRepository,
} from "@/adapters/database/repositories";
import { ApplicationError } from "@application/errors";

const balanceUseCases =
  createBalanceUseCases({
    transactionRepository: TransactionRepository,
    incomeRepository: IncomeRepository,
    expenseRepository: ExpenseRepository,
  });

function sendFastifyError(
  reply: FastifyReply,
  error: unknown
) {
  if (error instanceof ApplicationError) {
    return reply
      .status(error.statusCode)
      .send({
        error: error.message,
      });
  }

  console.error(error);

  return reply
    .status(500)
    .send({
      error:
        "Erro interno do servidor.",
    });
}

export async function getBalanceFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId =
      request.user?.userId;

    if (!userId) {
      return reply
        .status(401)
        .send({
          error:
            "Usuário não autenticado.",
        });
    }

    const balance = await balanceUseCases.recalculateBalance(userId);

    return reply
      .status(200)
      .send(balance);

  } catch (error) {
    return sendFastifyError(
      reply,
      error
    );
  }
}
