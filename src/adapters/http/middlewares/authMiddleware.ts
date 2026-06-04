import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "@/shared/config/env.js";
import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

interface JwtPayload {
  userId: string;
  role?: UserRole;
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
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (!decoded.userId || typeof decoded.userId !== "string") {
      throw new Error("Token sem identificador de usuario.");
    }

    request.user = {
      userId: decoded.userId,
      role: decoded.role ?? UserRole.USER,
    };
  } catch {
    return reply.status(401).send({
      success: false,
      message: "Token invalido ou expirado.",
      error: {
        code: "INVALID_TOKEN",
        details: [],
      },
    });
  }
}
