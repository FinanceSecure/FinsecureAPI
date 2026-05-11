import { FastifyReply, FastifyRequest } from "fastify";
import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { HttpError } from "../exceptions/HttpError.js";
import type {
  CreateTransactionRequestDto,
  UpdateTransactionRequestDto,
  ValidatedTransactionDto,
} from "@application/dto/transaction/";

declare module "fastify" {
  interface FastifyRequest {
    validatedTransaction?: ValidatedTransactionDto;
    user?: {
      userId: string;
    };
  }
}

function buildValidatedTransaction(
  request: FastifyRequest<{
    Body: CreateTransactionRequestDto | UpdateTransactionRequestDto;
  }>
): ValidatedTransactionDto {

  const {
    title,
    description,
    amount,
    date,
    type,
    category,
    isRecurring,
  } = request.body;

  const userId = request.user?.userId;

  if (!userId)
    throw new HttpError("Usuário não autenticado", 401);

  if (!title || amount === undefined || !date || !type)
    throw new HttpError("Dados incompletos ou inválidos", 400);

  if (
    typeof title !== "string" ||
    typeof amount !== "number" ||
    typeof type !== "string"
  ) {
    throw new HttpError("Formato de dados inválidos", 422);
  }

  if (amount <= 0)
    throw new HttpError("O valor da transação deve ser maior que zero", 422);

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime()))
    throw new HttpError("Data inválida", 422);

  if (!Object.values(TransactionType).includes(type))
    throw new HttpError("Tipo de transação inválido", 422);

  if (category && !Object.values(TransactionCategory)
    .includes(category as TransactionCategory)
  ) {
    throw new HttpError(
      "Categoria inválida",
      422
    );
  }

  if (title.length > 100)
    throw new HttpError(
      "Título muito longo",
      422
    );

  if (description && description.length > 255)
    throw new HttpError(
      "Descrição muito longa",
      422
    );

  const now = new Date();
  const status: TransactionStatus =
    parsedDate > now
      ? "PENDING"
      : "COMPLETED";

  return {
    userId,
    title: title.trim(),
    description: description?.trim(),
    amount,
    date: parsedDate,
    type,
    category,
    status,
    isRecurring: isRecurring ?? false,
  };
}

export async function validarTransacaoFastify(
  request: FastifyRequest<{
    Body: CreateTransactionRequestDto | UpdateTransactionRequestDto;
  }>,
  reply: FastifyReply
) {
  try {
    request.validatedTransaction =
      buildValidatedTransaction(request);
  } catch (error) {

    if (error instanceof HttpError) {
      return reply
        .status(error.status)
        .send({ error: error.message });
    }

    return reply
      .status(500)
      .send({
        error: "Erro interno do servidor",
      });
  }
}

export async function validarAtualizacaoTransacaoFastify(
  request: FastifyRequest<{
    Body: UpdateTransactionRequestDto;
  }>,
  reply: FastifyReply
) {
  try {
    const {
      title,
      description,
      amount,
      date,
      type,
    } = request.body;

    if (title !== undefined && typeof title !== "string")
      throw new HttpError("Título inválido", 422);

    if (description !== undefined && typeof description !== "string")
      throw new HttpError("Descrição inválida", 422);

    if (amount !== undefined && typeof amount !== "number")
      throw new HttpError("Valor inválido", 422);

    if (date !== undefined && isNaN(new Date(date).getTime()))
      throw new HttpError("Data inválida", 422);

    if (type !== undefined && !Object.values(TransactionType).includes(type))
      throw new HttpError("Tipo inválido", 422);


  } catch (error) {
    if (error instanceof HttpError) {
      return reply.status(error.status).send({
        error: error.message
      });
    }

    return reply.status(500).send({
      error: "Erro interno do servidor"
    });
  }
}
