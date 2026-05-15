import { FastifyInstance } from "fastify";
import { registerInvestmentRoutes } from "./investmentRoutes.js";
import { registerTransactionRoutes } from "./transactionRoutes.js";
import { registerUserRoutes } from "./userRoutes";

export async function registerHttpRoutes(app: FastifyInstance) {
  await registerUserRoutes(app);
  await registerTransactionRoutes(app);
  await registerInvestmentRoutes(app);
}
