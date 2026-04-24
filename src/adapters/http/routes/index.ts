import { FastifyInstance } from "fastify";
import { registerBalanceRoutes } from "./saldoRoutes.js";
import { registerExpenseRoutes } from "./despesaRoutes.js";
import { registerIncomeRoutes } from "./receitaRoutes.js";
import { registerInvestmentRoutes } from "./investimentoRoutes.js";
import { registerTransactionRoutes } from "./trasacaoRoutes.js";
import { registerUserRoutes } from "./usuarioRoutes.js";

export async function registerHttpRoutes(app: FastifyInstance) {
  await registerUserRoutes(app);
  await registerTransactionRoutes(app);
  await registerBalanceRoutes(app);
  await registerInvestmentRoutes(app);
  await registerExpenseRoutes(app);
  await registerIncomeRoutes(app);
}
