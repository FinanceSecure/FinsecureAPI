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
import { despesaRepository } from "@adapters/database/repositories/despesaRepository.js";
import { receitaRepository } from "@adapters/database/repositories/receitaRepository.js";
import { SaldoRepository } from "@adapters/database/repositories/saldoRepository.js";
import { transacaoRepository } from "@adapters/database/repositories/transacaoRepository.js";

const saldoUseCases = criarSaldoUseCases({
  saldoRepository: new SaldoRepository(),
  transacaoRepository,
  receitaRepository,
  despesaRepository,
});

const despesaUseCases = criarDespesaUseCases({
  despesaRepository,
  recalcularSaldo: saldoUseCases.recalcularSaldo,
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
  const userId = request.user?.usuarioId;

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
      usuarioId: userId,
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
