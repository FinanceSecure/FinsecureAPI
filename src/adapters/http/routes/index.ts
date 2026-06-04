import { FastifyInstance } from "fastify";
import { registerInvestmentRoutes } from "./investmentRoutes.js";
import { registerTransactionRoutes } from "./transactionRoutes.js";
import { registerUserRoutes } from "./userRoutes.js";

export async function registerHttpRoutes(app: FastifyInstance) {
  app.get("/health", {
    schema: {
      security: [],
      summary: "Verificar disponibilidade da API",
      tags: ["Infraestrutura"],
    },
  }, async () => ({
    status: "ok",
    service: "financesecure-api",
  }));

  await registerUserRoutes(app);
  await registerTransactionRoutes(app);
  await registerInvestmentRoutes(app);
}
