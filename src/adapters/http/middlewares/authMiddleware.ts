import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "@/shared/config/env.js";

export interface AuthenticatedUser {
  userId: string;
}

interface JwtPayload {
  userId: string;
  name: string;
  iat: number;
  exp: number;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function autenticarTokenFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({
      error: "Token não fornecido ou formato inválido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.jwtSecret
    ) as JwtPayload;

    request.user = {
      userId: decoded.userId,
    };
  } catch (error: any) {
    request.log.error(error);

    return reply.status(403).send({
      error: error.message,
    });
  }
}
