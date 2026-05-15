import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import type {
  AddInvestmentRequestDto,
  AddInvestmentTypeRequestDto,
  InvestmentStatementParamsDto,
  RedeemInvestmentRequestDto,
  UpdateInvestmentTypeRequestDto,
} from "@application/dto/investment/";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import {
  addInvestmentFastify,
  getInvestedAmountFastify,
  getInvestmentStatementFastify,
  listInvestmentTypesFastify,
  redeemInvestmentFastify,
  updateInvestmentTypeFastify,
} from "../controllers";
import {
  addInvestmentTypeFastify,
  getInvestmentTypeFastify,
} from "../controllers";

export async function registerInvestmentRoutes(app: FastifyInstance) {
  const auth = { preHandler: autenticarTokenFastify };

  app.get(
    "/api/investimento/extrato",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Obter extrato de investimentos",
        tags: ["Investimentos"],
      },
    },
    getInvestmentStatementFastify
  );

  app.get(
    "/api/investimento/total-investido",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Obter total investido",
        tags: ["Investimentos"],
      },
    },
    getInvestedAmountFastify
  );

  app.post<{ Body: AddInvestmentRequestDto }>(
    "/api/investimento/adicionar",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Adicionar investimento",
        tags: ["Investimentos"],
        body: {
          type: "object",
          anyOf: [
            { required: ["investmentTypeId", "investedAmount", "purchaseDate"] },
            { required: ["tipoInvestimentoId", "valorInvestido", "dataCompra"] },
          ],
          properties: {
            investmentTypeId: { type: "string" },
            investedAmount: { type: "number" },
            purchaseDate: { type: "string", format: "date" },
            tipoInvestimentoId: { type: "string" },
            valorInvestido: { type: "number" },
            dataCompra: { type: "string", format: "date" },
            updatedAt: { type: "string", format: "date" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              investment: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  userId: { type: "string" },
                  investmentTypeId: { type: "string" },
                  totalApplied: { type: "number" },
                  totalRedeemed: { type: "number" },
                  currentBalance: { type: "number" },
                  lastYieldAt: { type: "string", nullable: true },
                  isRedeemed: { type: "boolean" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string", nullable: true }
                }
              },
              application: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  investmentId: { type: "string" },
                  type: { type: "string" },
                  amount: { type: "number" },
                  date: { type: "string" },
                  transactionId: { type: "string" }
                }
              }
            }
          },
          400: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    addInvestmentFastify
  );

  app.post<{
    Params: InvestmentStatementParamsDto;
    Body: RedeemInvestmentRequestDto;
  }>(
    "/api/investimento/resgatar/:id",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Resgatar investimento por tipo",
        description: "Realiza o resgate debitando dos aportes mais antigos do tipo especificado.",
        tags: ["Investimentos"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "investmentTypeId" },
          },
        },
        body: {
          type: "object",
          anyOf: [
            { required: ["amount"] },
            { required: ["investedAmount"] },
          ],
          properties: {
            amount: { type: "number" },
            investedAmount: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              requested: { type: "number" },
              totalRedeemed: { type: "number" },
              remainingBalance: { type: "number" },
              details: { type: "array" },
            },
          },
          400: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    redeemInvestmentFastify
  );

  app.get<{
    Params: InvestmentStatementParamsDto;
    Querystring: { valor?: number };
  }>(
    "/api/investimento/tipo/:id",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Detalhar tipo de investimento com simulação",
        tags: ["Tipos de Investimento"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        querystring: {
          type: "object",
          properties: {
            valor: {
              type: "number",
              description: "Valor para simulação (padrão: 1000)"
            }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              type: { type: "string" },
              benchmarkPercentage: { type: "number" },
              hasIncomeTax: { type: "boolean" },
              simulacao: {
                type: "object",
                properties: {
                  valorInicial: { type: "number" },
                  rendimentoDiario: { type: "number" },
                  rendimentoMensal: { type: "number" },
                  rendimentoAnual: { type: "number" }
                }
              }
            }
          },
          400: { type: "object", properties: { error: { type: "string" } } },
          401: { type: "object", properties: { error: { type: "string" } } },
          404: { type: "object", properties: { error: { type: "string" } } }
        },
      },
    },
    getInvestmentTypeFastify
  );

  app.get(
    "/api/investimento/tipo",
    {
      schema: {
        summary: "Listar tipos de investimento",
        tags: ["Tipos de Investimento"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                type: { type: "string" },
                benchmarkPercentage: { type: "number" },
                hasIncomeTax: { type: "boolean" }
              }
            }
          },
          401: { type: "object", properties: { error: { type: "string" } } }
        },
      },
    },
    listInvestmentTypesFastify
  );

  app.post<{ Body: AddInvestmentTypeRequestDto }>(
    "/api/investimento/tipo/adicionar",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Adicionar tipo de investimento",
        tags: ["Tipos de Investimento"],
        body: {
          type: "object",
          required: [
            "name",
            "type",
            "benchmarkPercentage",
            "hasIncomeTax"
          ],
          properties: {
            name: {
              type: "string"
            },
            type: {
              type: "string",
              enum: [
                "FIXED_INCOME",
                "STOCKS",
                "FII",
                "ETF",
                "CRYPTO",
                "FUND"
              ]
            },
            benchmarkPercentage: {
              type: "number"
            },
            hasIncomeTax: {
              type: "boolean"
            },
          }
        },
        response: {
          201: { type: "object", properties: { id: { type: "string" } } }
        },
      },
    },
    addInvestmentTypeFastify
  );

  app.put<{
    Params: {
      id: string
    }
    Body: UpdateInvestmentTypeRequestDto
  }>(
    "/api/investimento/tipo/atualizar/:id",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Atualizar tipo de investimento",
        tags: ["Tipos de Investimento"],
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: {
              type: "string",
              enum: [
                "FIXED_INCOME",
                "STOCKS",
                "FII",
                "ETF",
                "CRYPTO",
                "FUND"
              ],
            },
            benchmarkPercentage: { type: "number" },
            hasIncomeTax: { type: "boolean" }
          },
        },
        response: {
          200: {
            description: "Tipo de investimento atualizado com sucesso",
            type: "object", properties: { message: { type: "string" } }
          }
        },
      },
    },
    updateInvestmentTypeFastify
  );
}
