import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionType } from "@prisma/client";
import { HttpError } from "../exceptions/HttpError.js";
import type {
  CreateTransactionRequestDto,
  UpdateTransactionRequestDto,
  ValidatedTransactionDto,
} from "@application/dto/transaction/index.js";

declare module "fastify" {
  interface FastifyRequest {
    validatedTransaction?: ValidatedTransactionDto;
    user?: {
      userId: string;
    };
  }
}

function normalizeTransactionType(type: string) {
  if (type === "ENTRADA") return TransactionType.INCOME;
  if (type === "SAIDA") return TransactionType.EXPENSE;
  return type as TransactionType;
}

function buildValidatedTransaction(
  request: FastifyRequest<{
    Body: CreateTransactionRequestDto | UpdateTransactionRequestDto;
  }>
) {
  const { descricao: description, valor: amount, data: date, tipo: type } = request.body;
  const userId = request.user?.userId;
  const parsedDate = new Date(date);
  const validTypes = ["ENTRADA", "SAIDA", ...Object.values(TransactionType)];

  if (!userId) throw new HttpError("UsuÃ¡rio nÃ£o autenticado", 401);

  if (!description || amount === undefined || !date || !type)
    throw new HttpError("Dados incompletos ou invÃ¡lidos", 400);

  if (
    typeof description !== "string" ||
    typeof amount !== "number" ||
    typeof type !== "string"
  ) {
    throw new HttpError("Formato de dados invÃ¡lidos", 422);
  }

  if (isNaN(parsedDate.getTime()))
    throw new HttpError("Data invÃ¡lida", 422);

  if (!validTypes.includes(type))
    throw new HttpError("Tipo deve ser informado como ENTRADA ou SAIDA", 422);

  if (description.length > 255) {
    throw new HttpError(
      "DescriÃ§Ã£o muito longa informada, o mÃ¡ximo Ã© de 255 caracteres",
      422
    );
  }

  if ((type === "ENTRADA" || type === TransactionType.INCOME) && amount <= 0)
    throw new HttpError("O valor da ENTRADA deve ser superior a 0", 422);

  if ((type === "SAIDA" || type === TransactionType.EXPENSE) && amount >= 0)
    throw new HttpError("O valor da SAIDA deve ser inferior a 0", 422);

  const now = new Date();
  const status = parsedDate > now ? "PENDING" : "COMPLETED";

  return {
    description,
    amount,
    date: parsedDate,
    type: normalizeTransactionType(type),
    userId,
    status,
  } satisfies ValidatedTransactionDto;
}

export async function validarTransacaoFastify(
  request: FastifyRequest<{
    Body: CreateTransactionRequestDto | UpdateTransactionRequestDto;
  }>,
  reply: FastifyReply
) {
  try {
    request.validatedTransaction = buildValidatedTransaction(request);
  } catch (error) {
    if (error instanceof HttpError)
      return reply.status(error.status).send({ error: error.message });

    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
