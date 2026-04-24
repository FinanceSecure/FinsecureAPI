import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import type {
  AddInvestmentRequestDto,
  AddInvestmentTypeRequestDto,
  InvestmentStatementParamsDto,
  RedeemInvestmentRequestDto,
} from "@application/dto/investimento/index.js";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import {
  addInvestmentFastify,
  getInvestedAmountFastify,
  getInvestmentStatementByTypeFastify,
  getInvestmentStatementFastify,
  redeemInvestmentFastify,
} from "../controllers/investimentoController.js";
import {
  addInvestmentTypeFastify,
  getInvestmentTypeFastify,
} from "../controllers/tipoInvestimentoController.js";

export async function registerInvestmentRoutes(app: FastifyInstance) {
  const auth = { preHandler: autenticarTokenFastify };

  app.get(
    "/api/investimento/extrato",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Obter extrato de investimentos",
        description: "Retorna o extrato completo de todos os investimentos do usuário autenticado.",
        tags: ["Investimentos"],
        response: {
          200: {
            description: "Extrato de investimentos retornado com sucesso",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                tipoInvestimento: { type: "string" },
                valorAplicado: { type: "number" },
                dataAplicacao: { type: "string", format: "date-time" },
                valorAtual: { type: "number" },
                rendimento: { type: "number" },
                resgatado: { type: "boolean" },
              },
            },
          },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    getInvestmentStatementFastify
  );
  app.get<{
    Params: InvestmentStatementParamsDto;
  }>(
    "/api/investimento/extrato/:id",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Obter extrato de investimento por tipo",
        description: "Retorna o extrato de investimentos de um tipo específico para o usuário autenticado.",
        tags: ["Investimentos"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", description: "ID do tipo de investimento." },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Extrato de investimento por tipo retornado com sucesso",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                tipoInvestimento: { type: "string" },
                valorAplicado: { type: "number" },
                dataAplicacao: { type: "string", format: "date-time" },
                valorAtual: { type: "number" },
                rendimento: { type: "number" },
                resgatado: { type: "boolean" },
              },
            },
          },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
          404: { description: "Tipo de investimento não encontrado", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    getInvestmentStatementByTypeFastify
  );
  app.post<{ Body: AddInvestmentRequestDto }>(
    "/api/investimento/adicionar",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Adicionar um novo investimento",
        description: "Registra um novo investimento para o usuário autenticado.",
        tags: ["Investimentos"],
        body: {
          type: "object",
          required: ["tipoInvestimentoId", "valor", "dataCompra"],
          properties: {
            tipoInvestimentoId: { type: "string", format: "uuid", description: "ID do tipo de investimento." },
            valor: { type: "number", description: "Valor aplicado no investimento." },
            dataCompra: { type: "string", format: "date-time", description: "Data da aplicação do investimento." },
          },
        },
        response: {
          201: { type: "object", properties: { message: { type: "string", example: "Investimento adicionado com sucesso." } } },
          400: { description: "Requisição inválida", type: "object", properties: { error: { type: "string" } } },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
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
        summary: "Resgatar um investimento",
        description: "Realiza o resgate de um investimento específico pelo seu ID.",
        tags: ["Investimentos"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", description: "ID do investimento a ser resgatado." },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          required: ["valorResgate", "dataResgate"],
          properties: {
            valorResgate: { type: "number", description: "Valor a ser resgatado." },
            dataResgate: { type: "string", format: "date-time", description: "Data do resgate." },
          },
        },
        response: {
          200: { type: "object", properties: { message: { type: "string", example: "Investimento resgatado com sucesso." } } },
          400: { description: "Requisição inválida", type: "object", properties: { error: { type: "string" } } },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
          404: { description: "Investimento não encontrado", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    redeemInvestmentFastify
  );
  app.get(
    "/api/investimento/totalInvestido",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Obter valor total investido",
        description: "Retorna o valor total investido pelo usuário autenticado.",
        tags: ["Investimentos"],
        response: {
          200: {
            description: "Valor total investido retornado com sucesso",
            type: "object",
            properties: {
              totalInvestido: { type: "number", example: 15000.00 },
            },
          },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    getInvestedAmountFastify
  );
  app.post<{ Body: AddInvestmentTypeRequestDto }>(
    "/api/investimento/tipo/adicionar",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Adicionar um novo tipo de investimento",
        description: "Cria um novo tipo de investimento disponível na plataforma.",
        tags: ["Tipos de Investimento"],
        body: {
          type: "object",
          required: ["nome", "tipo", "valorPercentual", "impostoRenda"],
          properties: {
            nome: { type: "string", description: "Nome do tipo de investimento (ex: CDB, LCI, Ações)." },
            tipo: { type: "string", description: "Categoria do tipo de investimento (ex: Renda Fixa, Renda Variável)." },
            valorPercentual: { type: "number", description: "Percentual de rendimento anual (ex: 0.10 para 10%)." },
            impostoRenda: { type: "number", description: "Alíquota de imposto de renda (ex: 0.15 para 15%)." },
          },
        },
        response: {
          201: { type: "object", properties: { message: { type: "string", example: "Tipo de investimento adicionado com sucesso." } } },
          400: { description: "Requisição inválida", type: "object", properties: { error: { type: "string" } } },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    addInvestmentTypeFastify
  );
  app.get<{
    Params: InvestmentStatementParamsDto;
  }>(
    "/api/investimento/tipo/:id",
    {
      ...auth,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Obter detalhes de um tipo de investimento",
        description: "Retorna os detalhes de um tipo de investimento específico pelo seu ID.",
        tags: ["Tipos de Investimento"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", description: "ID do tipo de investimento." },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Detalhes do tipo de investimento retornado com sucesso",
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              nome: { type: "string" },
              tipo: { type: "string" },
              valorPercentual: { type: "number" },
              impostoRenda: { type: "number" },
            },
          },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
          404: { description: "Tipo de investimento não encontrado", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    getInvestmentTypeFastify
  );
}
