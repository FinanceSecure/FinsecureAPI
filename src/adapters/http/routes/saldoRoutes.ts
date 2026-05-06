import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import { getBalanceFastify } from "../controllers";

export async function registerBalanceRoutes(app: FastifyInstance) {
  app.get(
    "/api/saldo/verificar",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Verificar saldo atual",
        tags: ["Transações"],
      },
    },
    getBalanceFastify
  );
}
