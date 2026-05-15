import { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../exceptions/HttpError.js";
import { ApplicationError } from "../../../application/errors/ApplicationError.js";

export function erroMiddleware(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof HttpError)
    return reply.status(error.status).send({ error: error.message });

  if (error instanceof ApplicationError)
    return reply.status(error.statusCode).send({ error: error.message });

  if (error instanceof Error) {
    request.log.error(error);
    return reply.status(500).send({ error: error.message });
  }

  return reply.status(500).send({ error: "Erro interno inesperado." });
}
