import { FastifyReply, FastifyRequest } from "fastify";
import type {
  FixedIncomeRequestDto,
  UpdateVariableIncomeRequestDto,
  VariableIncomeParamsDto,
  VariableIncomeRequestDto,
} from "@application/dto/income/";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import {
  createIncomeUseCases,
  createBalanceUseCases,
} from "@application/use-cases/";
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

const incomeUseCases = createIncomeUseCases({
  incomeRepository: IncomeRepository,
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

export async function getIncomeSummaryFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const incomes = await incomeUseCases.checkIncomes(userId);
    return reply.status(200).send(incomes);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getFixedIncomeFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const fixedIncome = await incomeUseCases.checkFixedIncome(userId);
    return reply.status(200).send(fixedIncome);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function createFixedIncomeFastify(
  request: FastifyRequest<{ Body: FixedIncomeRequestDto }>,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const fixedIncome = await incomeUseCases.addFixedIncome({
      userId: userId,
      amount: request.body.valor,
    });

    return reply.status(201).send(fixedIncome);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function updateFixedIncomeFastify(
  request: FastifyRequest<{ Body: FixedIncomeRequestDto }>,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const updatedFixedIncome = await incomeUseCases.updateFixedIncome({
      userId: userId,
      amount: request.body.valor,
    });

    return reply.status(200).send(updatedFixedIncome);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function deleteFixedIncomeFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const removedFixedIncome = await incomeUseCases.removeFixedIncome(userId);

    return reply.status(200).send({
      message: "Renda fixa removida com sucesso.",
      rendaFixaRemovida: removedFixedIncome,
    });
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getVariableIncomeFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const variableIncome = await incomeUseCases.checkVariableIncome(userId);
    return reply.status(200).send(variableIncome);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function createVariableIncomeFastify(
  request: FastifyRequest<{ Body: VariableIncomeRequestDto }>,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const variableIncome = await incomeUseCases.addVariableIncome({
      userId: userId,
      description: request.body.descricao,
      amount: request.body.valor,
    });

    return reply.status(201).send(variableIncome);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function updateVariableIncomeFastify(
  request: FastifyRequest<{ Body: UpdateVariableIncomeRequestDto }>,
  reply: FastifyReply
) {
  try {
    const updatedVariableIncome =
      await incomeUseCases.updateVariableIncome({
        id: request.body.id,
        description: request.body.descricao,
        amount: request.body.valor,
      });

    return reply.status(200).send(updatedVariableIncome);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function deleteVariableIncomeFastify(
  request: FastifyRequest<{ Params: VariableIncomeParamsDto }>,
  reply: FastifyReply
) {
  try {
    const removedVariableIncome =
      await incomeUseCases.removeVariableIncome(request.params.id);

    return reply.status(200).send({
      message: "Renda variável removida com sucesso.",
      rendaVariavelRemovida: removedVariableIncome,
    });
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
