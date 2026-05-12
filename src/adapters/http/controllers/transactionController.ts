import { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateTransactionRequestDto,
  TransactionParamsDto,
  UpdateTransactionRequestDto,
} from "@application/dto/transaction";

import { createTransactionUseCases } from "@application/use-cases";
import { ApplicationError } from "@application/errors";

import {
  TransactionRepository,
} from "@/adapters/database/repositories";

import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

const transactionUseCases =
  createTransactionUseCases({
    transactionRepository: TransactionRepository,

    recalculateBalance: async () => 0,
  });

function sendFastifyError(
  reply: FastifyReply,
  error: unknown
) {
  if (error instanceof ApplicationError) {
    return reply
      .status(error.statusCode)
      .send({
        error: error.message,
      });
  }

  if (error instanceof Error) {
    return reply
      .status(500)
      .send({
        error: error.message,
      });
  }

  return reply
    .status(500)
    .send({
      error: "Erro interno inesperado.",
    });
}

function getAuthenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.userId;

  if (!userId) {
    reply
      .status(401)
      .send({
        error: "Usuário não autenticado.",
      });

    return null;
  }

  return userId;
}

function normalizeTransactionType(
  type: string
): TransactionType {
  if (type === "ENTRADA")
    return "INCOME";

  if (type === "SAIDA")
    return "EXPENSE";

  return type as TransactionType;
}

export async function createTransactionFastify(
  request: FastifyRequest<{
    Body: CreateTransactionRequestDto;
  }>,
  reply: FastifyReply
) {
  const userId =
    getAuthenticatedUserId(
      request,
      reply
    );

  if (!userId)
    return;

  try {
    const {
      title,
      description,
      amount,
      date,
      type,
      category,
    } = request.body;

    const normalizedType =
      normalizeTransactionType(type);

    const result =
      await transactionUseCases.addTransaction(
        title,
        userId,
        amount,
        new Date(date),
        normalizedType,
        category ?? TransactionCategory.OTHER,
        description,
        TransactionStatus.COMPLETED
      );

    return reply
      .status(201)
      .send(result);

  } catch (error) {
    return sendFastifyError(
      reply,
      error
    );
  }
}

export async function getStatementFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = getAuthenticatedUserId(request, reply);

  if (!userId)
    return;

  try {
    const statement = await transactionUseCases.getFinancialStatement(userId);

    return reply
      .status(200)
      .send(statement);

  } catch (error) {
    return sendFastifyError(
      reply,
      error
    );
  }
}

export async function updateTransactionFastify(
  request: FastifyRequest<{
    Params: TransactionParamsDto;
    Body: UpdateTransactionRequestDto;
  }>,
  reply: FastifyReply
) {
  const userId =
    getAuthenticatedUserId(
      request,
      reply
    );

  if (!userId)
    return;

  try {
    const transactionId =
      request.params.id;

    if (!transactionId) {
      return reply
        .status(400)
        .send({
          error: "Transação não encontrada.",
        });
    }

    const {
      title,
      description,
      amount,
      date,
      type,
      category,
    } = request.body;

    const normalizedType = type ? normalizeTransactionType(type) : undefined;

    const updatedTransaction =
      await transactionUseCases.updateTransaction(
        transactionId,
        userId,
        title,
        description,
        amount,
        date ? new Date(date) : undefined,
        normalizedType,
        category
      );

    return reply
      .status(200)
      .send({
        message: "Transação atualizada com sucesso.",
        transaction: updatedTransaction,
      });

  } catch (error) {
    return sendFastifyError(
      reply,
      error
    );
  }
}

export async function deleteTransactionFastify(
  request: FastifyRequest<{
    Params: TransactionParamsDto;
  }>,
  reply: FastifyReply
) {
  const userId =
    getAuthenticatedUserId(
      request,
      reply
    );

  if (!userId)
    return;

  try {
    const transactionId =
      request.params.id;

    if (!transactionId) {
      return reply
        .status(400)
        .send({
          error: "Transação não encontrada.",
        });
    }

    const removedTransaction =
      await transactionUseCases.removeTransaction(
        transactionId,
        userId
      );

    return reply
      .status(200)
      .send(
        removedTransaction
      );

  } catch (error) {
    return sendFastifyError(
      reply,
      error
    );
  }
}
