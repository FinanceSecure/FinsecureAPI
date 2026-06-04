import { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../exceptions/HttpError.js";
import { ApplicationError } from "../../../application/errors/ApplicationError.js";

type FastifyLikeError = Error & {
  statusCode?: number;
  code?: string;
  validation?: { instancePath?: string; message?: string }[];
};

export function erroMiddleware(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof HttpError)
    return reply.status(error.status).send({
      success: false,
      message: error.message,
      error: { code: "HTTP_ERROR", details: [] },
    });

  if (error instanceof ApplicationError)
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
      error: { code: error.name, details: [] },
    });

  if (error instanceof Error) {
    const fastifyError = error as FastifyLikeError;

    if (fastifyError.validation) {
      return reply.status(400).send({
        success: false,
        message: "Payload invalido.",
        error: {
          code: "VALIDATION_ERROR",
          details: fastifyError.validation.map((detail) => ({
            field: detail.instancePath || "body",
            message: detail.message || "Valor invalido.",
          })),
        },
      });
    }

    if (fastifyError.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        message: "Limite de requisicoes excedido. Tente novamente em breve.",
        error: { code: "RATE_LIMIT_EXCEEDED", details: [] },
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro interno inesperado.",
      error: { code: "INTERNAL_SERVER_ERROR", details: [] },
    });
  }

  return reply.status(500).send({
    success: false,
    message: "Erro interno inesperado.",
    error: { code: "INTERNAL_SERVER_ERROR", details: [] },
  });
}
