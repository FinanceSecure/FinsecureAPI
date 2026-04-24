import { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateTransactionRequestDto,
  TransactionParamsDto,
  UpdateTransactionRequestDto,
} from "@application/dto/transacao/index.js";
import { criarSaldoUseCases, criarTransacaoUseCases } from "@application/use-cases/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
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

const transacaoUseCases = criarTransacaoUseCases({
  transacaoRepository,
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

export async function createTransactionFastify(
  request: FastifyRequest<{ Body: CreateTransactionRequestDto }>,
  reply: FastifyReply
) {
  try {
    const data = request.validatedTransaction;

    if (!data) {
      return reply.status(400).send({ error: "Transação inválida." });
    }

    const result = await transacaoUseCases.adicionarTransacao(
      data.usuarioId,
      data.descricao,
      data.valor,
      data.data,
      data.tipo
    );

    return reply.status(201).send(result);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function updateTransactionFastify(
  request: FastifyRequest<{
    Params: TransactionParamsDto;
    Body: UpdateTransactionRequestDto;
  }>,
  reply: FastifyReply
) {
  try {
    const transactionId = request.params.id;
    const userId = request.user?.usuarioId;

    if (!transactionId) {
      return reply.status(400).send({ error: "Transação não encontrada." });
    }

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const { descricao, valor, data, tipo } = request.body;

    const updatedTransaction = await transacaoUseCases.atualizarTransacao(
      transactionId,
      userId,
      descricao,
      valor,
      new Date(data),
      tipo
    );

    return reply.status(200).send(updatedTransaction);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function deleteTransactionFastify(
  request: FastifyRequest<{ Params: TransactionParamsDto }>,
  reply: FastifyReply
) {
  try {
    const transactionId = request.params.id;
    const userId = request.user?.usuarioId;

    if (!transactionId) {
      return reply.status(400).send({ error: "Transação não encontrada." });
    }

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const deletedTransaction = await transacaoUseCases.excluirTransacao(
      transactionId,
      userId
    );

    return reply.status(200).send(deletedTransaction);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
