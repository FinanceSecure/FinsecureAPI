import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import type {
  FixedIncomeRequestDto,
  UpdateVariableIncomeRequestDto,
  VariableIncomeParamsDto,
  VariableIncomeRequestDto,
} from "@application/dto/receita/index.js";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import {
  createFixedIncomeFastify,
  createVariableIncomeFastify,
  deleteFixedIncomeFastify,
  deleteVariableIncomeFastify,
  getFixedIncomeFastify,
  getIncomeSummaryFastify,
  getVariableIncomeFastify,
  updateFixedIncomeFastify,
  updateVariableIncomeFastify,
} from "../controllers/receitaController.js";

export async function registerIncomeRoutes(app: FastifyInstance) {
  const auth = { preHandler: autenticarTokenFastify };

  app.get(
    "/api/receita/verificar",
    {
      ...auth,
      schema: {
        summary: "Verificar resumo de receitas",
        tags: ["Receitas"],
      },
    },
    getIncomeSummaryFastify
  );
  app.get(
    "/api/receita/verificar/rendaFixa",
    {
      ...auth,
      schema: {
        summary: "Verificar receitas de renda fixa",
        tags: ["Receitas"],
      },
    },
    getFixedIncomeFastify
  );
  app.post<{ Body: FixedIncomeRequestDto }>(
    "/api/receita/adicionar/rendaFixa",
    {
      ...auth,
      schema: {
        summary: "Adicionar receita de renda fixa",
        tags: ["Receitas"],
      },
    },
    createFixedIncomeFastify
  );
  app.put<{ Body: FixedIncomeRequestDto }>(
    "/api/receita/alterar/rendaFixa",
    {
      ...auth,
      schema: {
        summary: "Alterar receita de renda fixa",
        tags: ["Receitas"],
      },
    },
    updateFixedIncomeFastify
  );
  app.delete(
    "/api/receita/remover/rendaFixa",
    {
      ...auth,
      schema: {
        summary: "Remover receita de renda fixa",
        tags: ["Receitas"],
      },
    },
    deleteFixedIncomeFastify
  );
  app.get(
    "/api/receita/verificar/rendaVariavel",
    {
      ...auth,
      schema: {
        summary: "Verificar receitas de renda variável",
        tags: ["Receitas"],
      },
    },
    getVariableIncomeFastify
  );
  app.post<{ Body: VariableIncomeRequestDto }>(
    "/api/receita/adicionar/rendaVariavel",
    {
      ...auth,
      schema: {
        summary: "Adicionar receita de renda variável",
        tags: ["Receitas"],
      },
    },
    createVariableIncomeFastify
  );
  app.put<{ Body: UpdateVariableIncomeRequestDto }>(
    "/api/receita/alterar/rendaVariavel",
    {
      ...auth,
      schema: {
        summary: "Alterar receita de renda variável",
        tags: ["Receitas"],
      },
    },
    updateVariableIncomeFastify
  );
  app.delete<{ Params: VariableIncomeParamsDto }>(
    "/api/receita/remover/rendaVariavel/:id",
    {
      ...auth,
      schema: {
        summary: "Remover receita de renda variável",
        tags: ["Receitas"],
      },
    },
    deleteVariableIncomeFastify
  );
}
