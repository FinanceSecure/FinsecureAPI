import { FastifyReply, FastifyRequest } from "fastify";
import type {
  AddInvestmentRequestDto,
  InvestmentStatementParamsDto,
  RedeemInvestmentRequestDto,
} from "@application/dto/investment";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { createInvestmentUseCases } from "@application/use-cases";
import { InvestmentRepository } from "@adapters/database/repositories/investmentRepository.js";
import { ErroMessages } from "@/domain/erros";

const investmentUseCases = createInvestmentUseCases({
  investmentRepository: InvestmentRepository,
});

const cleanResponse = (data: any) =>
  JSON.parse(JSON.stringify(data));

function sendFastifyError(reply: FastifyReply, error: unknown) {
  console.error("DEBUG [InvestmentController]:", error);

  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({
      error: error.message,
    });
  }

  if (error instanceof Error) {
    return reply.status(500).send({
      error: error.message,
    });
  }

  return reply.status(500).send({
    error: "Erro interno inesperado no servidor.",
  });
}

function getAuthenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.userId;

  if (!userId) {
    reply.status(401).send({
      error: ErroMessages.AUTH.CREDENCIAIS_INVALIDAS,
    });

    return null;
  }

  return userId;
}

export async function getInvestmentStatementFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = getAuthenticatedUserId(request, reply);
    if (!userId) return;

    const investments =
      await investmentUseCases.getCompletedInvestments(userId);

    return reply.status(200).send(cleanResponse(investments));
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getInvestmentStatementByTypeFastify(
  request: FastifyRequest<{ Params: InvestmentStatementParamsDto }>,
  reply: FastifyReply
) {
  try {
    const userId = getAuthenticatedUserId(request, reply);
    if (!userId) return;

    const investmentTypeId = request.params.id;

    const statement =
      await investmentUseCases.getInvestmentsByType(
        userId,
        investmentTypeId
      );

    return reply.status(200).send(cleanResponse(statement));
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function redeemInvestmentFastify(
  request: FastifyRequest<{
    Params: InvestmentStatementParamsDto;
    Body: RedeemInvestmentRequestDto;
  }>,
  reply: FastifyReply
) {
  try {
    const userId = getAuthenticatedUserId(request, reply);
    if (!userId) return;

    const investmentTypeId = request.params.id;
    const amountToRedeem = Number(
      request.body.amount ?? request.body.investedAmount
    );

    if (isNaN(amountToRedeem) || amountToRedeem <= 0) {
      return reply.status(400).send({
        error: ErroMessages.INVESTIMENTO.VALOR_RESGATE_INVALIDO,
      });
    }

    const result =
      await investmentUseCases.redeemInvestment(
        userId,
        investmentTypeId,
        amountToRedeem
      );

    return reply.status(200).send(cleanResponse(result));
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function getInvestedAmountFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = getAuthenticatedUserId(request, reply);
    if (!userId) return;

    const total =
      await investmentUseCases.getTotalInvested(userId);

    return reply.status(200).send(cleanResponse(total));
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function addInvestmentFastify(
  request: FastifyRequest<{ Body: AddInvestmentRequestDto }>,
  reply: FastifyReply
) {
  try {
    const userId = getAuthenticatedUserId(request, reply);
    if (!userId) return;

    const investmentTypeId =
      request.body.investmentTypeId ?? request.body.tipoInvestimentoId;
    const investedAmount = Number(
      request.body.investedAmount ?? request.body.valorInvestido
    );
    const purchaseDateValue =
      request.body.purchaseDate ?? request.body.dataCompra;

    if (!investmentTypeId) {
      return reply.status(400).send({
        error: "Tipo de investimento nao informado.",
      });
    }

    if (!purchaseDateValue) {
      return reply.status(400).send({
        error: "Data de investimento nao informada.",
      });
    }

    const purchaseDate = new Date(purchaseDateValue);

    if (Number.isNaN(purchaseDate.getTime())) {
      return reply.status(400).send({
        error: "Data de investimento invalida.",
      });
    }

    const investment =
      await investmentUseCases.addInvestment(
        userId,
        investmentTypeId,
        investedAmount,
        purchaseDate
      );

    return reply.status(201).send(cleanResponse(investment));
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
