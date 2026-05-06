import { FastifyReply, FastifyRequest } from "fastify";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { criarSaldoUseCases } from "@application/use-cases/index.js";
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

function sendFastifyError(reply: FastifyReply, error: unknown) {
  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }

  return reply.status(500).send({ error: "Erro interno inesperado." });
}

export async function getBalanceFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const balance = await saldoUseCases.visualizarSaldo(userId);
    return reply.status(200).send(balance);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
