import { FastifyReply, FastifyRequest } from "fastify";
import type {
  AddInvestmentTypeRequestDto,
  InvestmentStatementParamsDto,
} from "@application/dto/investment/";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { createInvestmentTypeUseCases } from "@application/use-cases/";
import { InvestmentTypeRepository } from "@adapters/database/repositories/investmentTypeRepository.js";
import { UpdateInvestmentTypeRequestDto } from "@/application/dto/investment/investmentRequestDtos";

const investmentTypeUseCases = createInvestmentTypeUseCases(
  InvestmentTypeRepository
);

function sendFastifyError(reply: FastifyReply, error: unknown) {
  if (error instanceof ApplicationError)
    return reply.status(error.statusCode).send({ error: error.message });

  if (error instanceof Error)
    return reply.status(500).send({ error: error.message });

  return reply.status(500).send({ error: "Erro interno inesperado." });
}

export async function addInvestmentTypeFastify(
  request: FastifyRequest<{ Body: AddInvestmentTypeRequestDto }>,
  reply: FastifyReply
) {
  try {
    const {
      name,
      type,
      benchmarkPercentage,
      hasIncomeTax
    } = request.body;
    const investmentType =
      await investmentTypeUseCases.acrescentarTipoInvestimento(
        name,
        type,
        benchmarkPercentage,
        hasIncomeTax
      );

    return reply.status(201).send(investmentType);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getInvestmentTypeFastify(
  request: FastifyRequest<{
    Params: InvestmentStatementParamsDto;
    Querystring: { valor?: number };
  }>,
  reply: FastifyReply
) {
  try {
    const investmentTypeId = request.params.id;
    const valor = request.query.valor ?? 1000;

    if (!investmentTypeId)
      return reply.status(400).send({ error: "ID de investimento inválido." });

    const investmentType =
      await investmentTypeUseCases.visualizarTipoInvestimento(
        investmentTypeId,
        valor
      );

    if (!investmentType)
      return reply.status(404).send({ error: "Investimento não encontrado." });

    return reply.status(200).send(investmentType);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function listInvestmentTypesFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const investmentTypes = await investmentTypeUseCases.listarTiposInvestimento();
    return reply.status(200).send(investmentTypes);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function updateInvestmentTypeFastify(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: UpdateInvestmentTypeRequestDto;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const {
      name,
      type,
      benchmarkPercentage,
      hasIncomeTax,
    } = request.body;
    const result =
      await investmentTypeUseCases.atualizarTipoInvestimento(
        id,
        {
          name,
          type,
          benchmarkPercentage,
          hasIncomeTax,
        }
      );

    return reply.status(200).send(result);
  } catch (error) {
    return sendFastifyError(
      reply,
      error
    );
  }
}
