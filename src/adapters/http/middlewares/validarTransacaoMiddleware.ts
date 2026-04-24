import { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../exceptions/HttpError.js";
import type {
  CreateTransactionRequestDto,
  UpdateTransactionRequestDto,
  ValidatedTransactionDto,
} from "@application/dto/transacao/index.js";

declare module "fastify" {
  interface FastifyRequest {
    validatedTransaction?: ValidatedTransactionDto;
    user?: {
      usuarioId: string;
    };
  }
}

function buildValidatedTransaction(
  request: FastifyRequest<{
    Body: CreateTransactionRequestDto | UpdateTransactionRequestDto;
  }>
) {
  const { descricao, valor, data, tipo } = request.body;
  const usuarioId = request.user?.usuarioId;
  const parsedDate = new Date(data);
  const tiposValidos = ["ENTRADA", "SAIDA"];

  if (!usuarioId)
    throw new HttpError("Usuário não autenticado", 401);

  if (!descricao || valor === undefined || !data || !tipo)
    throw new HttpError("Dados incompletos ou inválidos", 400);

  if (
    typeof descricao !== "string" ||
    typeof valor !== "number" ||
    typeof tipo !== "string"
  ) {
    throw new HttpError("Formato de dados inválidos", 422);
  }

  if (isNaN(parsedDate.getTime()))
    throw new HttpError("Data inválida", 422);

  if (!tiposValidos.includes(tipo))
    throw new HttpError("Tipo deve ser informado como ENTRADA ou SAIDA", 422);


  if (descricao.length > 255) {
    throw new HttpError(
      "Descrição muito longa informada, o máximo é de 255 caracteres",
      422
    );
  }

  if (tipo === "ENTRADA" && valor <= 0)
    throw new HttpError("O valor da ENTRADA deve ser superior a 0", 422);

  if (tipo === "SAIDA" && valor >= 0)
    throw new HttpError("O valor da SAIDA deve ser inferior a 0", 422);


  const agora = new Date();
  const status = parsedDate > agora ? "PENDENTE" : "EFETIVADA";

  return {
    descricao,
    valor,
    data: parsedDate,
    tipo,
    usuarioId,
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
