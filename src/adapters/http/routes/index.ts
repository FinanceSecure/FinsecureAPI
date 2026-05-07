import { FastifyInstance } from "fastify";
import { registerExpenseRoutes } from "./expenseRoutes.js";
import { registerIncomeRoutes } from "./incomeRoutes.js";
import { registerInvestmentRoutes } from "./investmentRoutes.js";
import { registerTransactionRoutes } from "./transactionRoutes.js";
import { registerUserRoutes } from "./userRoutes";

export async function registerHttpRoutes(app: FastifyInstance) {
  await registerUserRoutes(app);
  await registerTransactionRoutes(app);
  await registerInvestmentRoutes(app);
  await registerExpenseRoutes(app);
  await registerIncomeRoutes(app);
}
