import { FastifyReply, FastifyRequest } from "fastify";
import type {
  AddExpenseRequestDto,
  ExpenseParamsDto,
} from "@application/dto/despesa/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import {
  criarDespesaUseCases,
  criarSaldoUseCases,
} from "@application/use-cases/index.js";
import { ExpenseRepository } from "@/adapters/database/repositories/expenseRepository";
import { ReceitaRepository } from "@adapters/database/repositories/receitaRepository";
import { BalanceRepository } from "@adapters/database/repositories/balanceRepository";
import { TransacaoRepository } from "@adapters/database/repositories/transacaoRepository";

const saldoUseCases = criarSaldoUseCases({
  balanceRepository: new BalanceRepository(),
  transacaoRepository: TransacaoRepository,
  receitaRepository: ReceitaRepository,
  despesaRepository: ExpenseRepository,
});

const despesaUseCases = criarDespesaUseCases({
  despesaRepository: ExpenseRepository,
  recalcularSaldo: async (userId: string) => {
    const resultado = await saldoUseCases.recalcularSaldo(userId);
    return resultado.saldo;
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
    const expenses = await despesaUseCases.verificarTotalDespesas(userId);
    return reply.status(200).send(expenses);
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

    const newExpense = await despesaUseCases.criarDespesa({
      valor,
      categoria,
      descricao,
      userId: userId,
      dataVencimento: dataVencimento ? new Date(dataVencimento) : new Date(),
      dataAgendamento: dataAgendamento ? new Date(dataAgendamento) : null,
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
      await despesaUseCases.listarDespesasAgendadas(userId);

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
    const expenses = await despesaUseCases.listarDespesas(userId);
    const expense = expenses.find((item) => item.id === request.params.id);

    if (!expense) {
      return reply.status(404).send({ error: "Despesa não encontrada." });
    }

    return reply.status(200).send(expense);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
