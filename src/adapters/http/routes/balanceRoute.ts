import { FastifyInstance } from "fastify";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import { getBalanceFastify } from "../controllers/balanceController.js";

export async function registerBalanceRoutes(
  app: FastifyInstance
) {
  app.get(
    "/api/saldo/verificar",
    {
      preHandler: autenticarTokenFastify,

      schema: {
        summary: "Consultar saldo atual",
        tags: ["Saldo"],
      },
    },

    getBalanceFastify
  );
}
