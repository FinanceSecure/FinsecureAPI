import { FastifyReply, FastifyRequest } from "fastify";

import type {
  CreateTransactionRequestDto,
  TransactionParamsDto,
  UpdateTransactionRequestDto,
} from "@application/dto/transaction";

import {
  createBalanceUseCases,
  createTransactionUseCases,
} from "@application/use-cases";

import { ApplicationError } from "@application/errors";

import {
  ExpenseRepository,
  IncomeRepository,
  TransactionRepository,
} from "@/adapters/database/repositories";

import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

const balanceUseCases =
  createBalanceUseCases({
    transactionRepository:
      TransactionRepository,

    incomeRepository:
      IncomeRepository,

    expenseRepository:
      ExpenseRepository,
  });

const transactionUseCases =
  createTransactionUseCases({
    transactionRepository:
      TransactionRepository,

    recalculateBalance: async (
      userId: string
    ) => {
      const result =
        await balanceUseCases.recalculateBalance(
          userId
        );

      return result.balance;
    },
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
      error:
        "Erro interno inesperado.",
    });
}

function getAuthenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId =
    request.user?.userId;

  if (!userId) {
    reply
      .status(401)
      .send({
        error:
          "Usuário não autenticado.",
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
      description,
      amount,
      date,
      type,
    } = request.body;

    const normalizedType =
      normalizeTransactionType(type);

    const result =
      await transactionUseCases.addTransaction(
        userId,
        description,
        amount,
        new Date(date),
        normalizedType,
        TransactionCategory.OTHER,
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
          error:
            "Transação não encontrada.",
        });
    }

    const {
      description,
      amount,
      date,
      type,
    } = request.body;

    const normalizedType =
      normalizeTransactionType(type);

    const updatedTransaction =
      await transactionUseCases.updateTransaction(
        transactionId,
        userId,
        description,
        amount,
        new Date(date),
        normalizedType,
        TransactionCategory.OTHER
      );

    return reply
      .status(200)
      .send(
        updatedTransaction
      );
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
          error:
            "Transação não encontrada.",
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
