import { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateTransactionRequestDto,
  TransactionParamsDto,
  UpdateTransactionRequestDto,
} from "@application/dto/transacao/index.js";
import { criarSaldoUseCases, criarTransacaoUseCases } from "@application/use-cases/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { ExpenseRepository } from "@/adapters/database/repositories/expenseRepository.js";
import { ReceitaRepository } from "@adapters/database/repositories/receitaRepository.js";
import { BalanceRepository } from "@adapters/database/repositories/balanceRepository";
import { TransacaoRepository } from "@adapters/database/repositories/transacaoRepository.js";

const saldoUseCases = criarSaldoUseCases({
  balanceRepository: new BalanceRepository(),
  transacaoRepository: TransacaoRepository,
  receitaRepository: ReceitaRepository,
  despesaRepository: ExpenseRepository,
});

const transacaoUseCases = criarTransacaoUseCases({
  transacaoRepository: TransacaoRepository,
  recalcularSaldo: async (userId: string) => {
    const resultado = await saldoUseCases.recalcularSaldo(userId);
    return resultado.saldo;
  },
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
      data.userId,
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
    const userId = request.user?.userId;

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
    const userId = request.user?.userId;

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
