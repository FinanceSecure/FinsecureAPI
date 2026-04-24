import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import type {
  AddExpenseRequestDto,
  ExpenseParamsDto,
} from "@application/dto/despesa/index.js";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import {
  addExpenseFastify,
  getExpenseByIdFastify,
  getExpenseSummaryFastify,
  getScheduledExpensesFastify,
} from "../controllers/despesaController.js";

export async function registerExpenseRoutes(app: FastifyInstance) {
  app.get(
    "/api/despesa/verificar",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Verificar resumo de despesas",
        tags: ["Despesas"],
      },
    },
    getExpenseSummaryFastify
  );
  app.get(
    "/api/despesa/agendadas",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Listar despesas agendadas",
        tags: ["Despesas"],
      },
    },
    getScheduledExpensesFastify
  );
  app.get<{ Params: ExpenseParamsDto }>(
    "/api/despesa/:id",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Obter despesa por ID",
        tags: ["Despesas"],
      },
    },
    getExpenseByIdFastify
  );
  app.post<{ Body: AddExpenseRequestDto }>(
    "/api/despesa/adicionar",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Adicionar nova despesa",
        tags: ["Despesas"],
      },
    },
    addExpenseFastify
  );
}
