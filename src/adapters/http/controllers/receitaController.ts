import { FastifyReply, FastifyRequest } from "fastify";
import type {
  FixedIncomeRequestDto,
  UpdateVariableIncomeRequestDto,
  VariableIncomeParamsDto,
  VariableIncomeRequestDto,
} from "@application/dto/receita/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import {
  criarReceitaUseCases,
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

const receitaUseCases = criarReceitaUseCases({
  receitaRepository,
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

export async function getIncomeSummaryFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);
  if (!userId) return;

  try {
    const incomes = await receitaUseCases.verificarReceitas(userId);
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
    const fixedIncome = await receitaUseCases.verificarRendaFixa(userId);
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
    const fixedIncome = await receitaUseCases.adicionarRendaFixa({
      usuarioId: userId,
      valor: request.body.valor,
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
    const updatedFixedIncome = await receitaUseCases.alterarRendaFixa({
      usuarioId: userId,
      valor: request.body.valor,
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
    const removedFixedIncome = await receitaUseCases.removerRendaFixa(userId);

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
    const variableIncome = await receitaUseCases.verificarRendaVariavel(userId);
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
    const variableIncome = await receitaUseCases.adicionarRendaVariavel({
      usuarioId: userId,
      descricao: request.body.descricao,
      valor: request.body.valor,
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
      await receitaUseCases.alterarRendaVariavel(request.body);

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
      await receitaUseCases.removerRendaVariavel(request.params.id);

    return reply.status(200).send({
      message: "Renda variável removida com sucesso.",
      rendaVariavelRemovida: removedVariableIncome,
    });
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
