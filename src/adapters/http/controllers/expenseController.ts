import { FastifyReply, FastifyRequest } from "fastify";
import type {
  AddExpenseRequestDto,
  ExpenseParamsDto,
} from "@application/dto/expense/";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import {
  createExpenseUseCases,
  createBalanceUseCases,
} from "@application/use-cases/";
import { ExpenseRepository } from "@/adapters/database/repositories/expenseRepository";
import { IncomeRepository } from "@adapters/database/repositories/incomeRepository.js";
import { BalanceRepository } from "@adapters/database/repositories/balanceRepository";
import { TransactionRepository } from "@adapters/database/repositories/transactionRepository.js";

const balanceUseCases = createBalanceUseCases({
  balanceRepository: new BalanceRepository(),
  transactionRepository: TransactionRepository,
  incomeRepository: IncomeRepository,
  expenseRepository: ExpenseRepository,
});

const expenseUseCases = createExpenseUseCases({
  expenseRepository: ExpenseRepository,
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

function getAuthenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.userId;

  if (!userId) {
    reply.status(404).send({ error: "Usuário não encontrado." });
    return null;
  }

  return userId;
}

export async function getExpenseSummaryFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const totalExpenses = await expenseUseCases.verifyTotalExpenses(userId);
    return reply.status(200).send(totalExpenses);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function addExpenseFastify(
  request: FastifyRequest<{ Body: AddExpenseRequestDto }>,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const { valor, categoria, descricao, dataVencimento, dataAgendamento } =
      request.body;

    const newExpense = await expenseUseCases.createExpense({
      amount: valor,
      category: categoria,
      description: descricao,
      userId: userId,
      dueDate: dataVencimento ? new Date(dataVencimento) : new Date(),
      scheduledAt: dataAgendamento ? new Date(dataAgendamento) : null,
    });

    return reply.status(201).send(newExpense);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getScheduledExpensesFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const scheduledExpenses =
      await expenseUseCases.listScheduledExpenses(userId);

    return reply.status(200).send(scheduledExpenses);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getExpenseByIdFastify(
  request: FastifyRequest<{ Params: ExpenseParamsDto }>,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const expenses = await expenseUseCases.listExpenses(userId);
    const expense = expenses.find((item) => item.id === request.params.id);

    if (!expense) {
      return reply.status(404).send({ error: "Despesa não encontrada." });
    }

    return reply.status(200).send(expense);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
