import { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@prisma/client";

export async function requireAdminFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (request.user?.role !== UserRole.ADMIN) {
    return reply.status(403).send({
      error: "Acesso administrativo necessário.",
    });
  }
}
