import { FastifyReply, FastifyRequest } from "fastify";
import type {
  AddInvestmentTypeRequestDto,
  InvestmentStatementParamsDto,
} from "@application/dto/investimento/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { criarTipoInvestimentoUseCases } from "@application/use-cases/index.js";
import { tipoInvestimentoRepository } from "@adapters/database/repositories/tipoInvestimentoRepository.js";

const tipoInvestimentoUseCases = criarTipoInvestimentoUseCases(
  tipoInvestimentoRepository
);

function sendFastifyError(reply: FastifyReply, error: unknown) {
  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }

  return reply.status(500).send({ error: "Erro interno inesperado." });
}

export async function addInvestmentTypeFastify(
  request: FastifyRequest<{ Body: AddInvestmentTypeRequestDto }>,
  reply: FastifyReply
) {
  try {
    const { nome, tipo, valorPercentual, impostoRenda } = request.body;

    const investmentType =
      await tipoInvestimentoUseCases.acrescentarTipoInvestimento(
        nome,
        tipo,
        valorPercentual,
        impostoRenda
      );

    return reply.status(201).send(investmentType);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getInvestmentTypeFastify(
  request: FastifyRequest<{ Params: InvestmentStatementParamsDto }>,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.usuarioId;
    const investmentTypeId = request.params.id;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    if (!investmentTypeId) {
      return reply.status(400).send({ error: "ID de investimento inválido." });
    }

    const investmentType =
      await tipoInvestimentoUseCases.visualizarTipoInvestimento(
        investmentTypeId
      );

    if (!investmentType) {
      return reply.status(404).send({ error: "Investimento não encontrado." });
    }

    return reply.status(200).send(investmentType);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
