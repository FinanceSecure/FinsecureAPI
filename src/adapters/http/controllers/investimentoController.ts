import { FastifyReply, FastifyRequest } from "fastify";
import type {
  AddInvestmentRequestDto,
  InvestmentStatementParamsDto,
  RedeemInvestmentRequestDto,
} from "@application/dto/investimento/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { criarInvestimentoUseCases } from "@application/use-cases/index.js";
import { InvestimentoRepository } from "@adapters/database/repositories/investimentoRepository.js";
import { SaldoRepository } from "@adapters/database/repositories/saldoRepository.js";

const investimentoUseCases = criarInvestimentoUseCases({
  investimentoRepository: InvestimentoRepository,
  saldoRepository: new SaldoRepository(),
});

const cleanResponse = (data: any) => JSON.parse(JSON.stringify(data));

function sendFastifyError(reply: FastifyReply, error: unknown) {
  console.error("DEBUG [InvestimentoController]:", error);

  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }

  return reply.status(500).send({ error: "Erro interno inesperado no servidor." });
}

export async function getInvestmentStatementFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.usuarioId;

    if (!userId)
      return reply.status(401).send({ error: "Usuário não autenticado." });

    const investments =
      await investimentoUseCases.investimentosEfetuados(userId);

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
    const userId = request.user?.usuarioId;
    const investmentId = request.params.id;

    if (!userId)
      return reply.status(401).send({ error: "Usuário não autenticado." });

    const statement = await investimentoUseCases.consultarInvestimentosPorTipo(
      userId,
      investmentId
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
    const userId = request.user?.usuarioId;
    const investmentTypeId = request.params.id;
    const amountToRedeem = Number(request.body.valor);

    if (!userId)
      return reply.status(401).send({ error: "Usuário não autenticado." });

    if (isNaN(amountToRedeem) || amountToRedeem <= 0)
      return reply.status(400).send({ error: "Valor de resgate inválido." });

    const result = await investimentoUseCases.resgatarInvestimento(
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
    const userId = request.user?.usuarioId;

    if (!userId)
      return reply.status(401).send({ error: "Usuário não autenticado." });

    const total = await investimentoUseCases.totalInvestido(userId);
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
    const userId = request.user?.usuarioId;
    const { tipoInvestimentoId, valorInvestido, dataCompra, dataAtualizacao } =
      request.body;

    if (!userId)
      return reply.status(401).send({ error: "Usuário não autenticado." });

    const investment = await investimentoUseCases.adicionarInvestimento(
      userId,
      tipoInvestimentoId,
      valorInvestido,
      new Date(dataCompra),
      dataAtualizacao ? new Date(dataAtualizacao) : undefined
    );

    return reply.status(201).send(cleanResponse(investment));
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
