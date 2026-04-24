import { FastifyReply, FastifyRequest } from "fastify";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { criarSaldoUseCases } from "@application/use-cases/index.js";
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
    const userId = request.user?.usuarioId;

    if (!userId) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const balance = await saldoUseCases.visualizarSaldo(userId);
    return reply.status(200).send(balance);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}
