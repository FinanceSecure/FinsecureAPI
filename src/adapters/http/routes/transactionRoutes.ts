import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import type {
  CreateTransactionRequestDto,
  TransactionParamsDto,
  UpdateTransactionRequestDto,
} from "@application/dto/transaction/";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import {
  validarAtualizacaoTransacaoFastify,
  validarTransacaoFastify
} from "../middlewares/validarTransacaoMiddleware.js";
import {
  createTransactionFastify,
  deleteTransactionFastify,
  updateTransactionFastify,
  getStatementFastify
} from "../controllers";

export async function registerTransactionRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateTransactionRequestDto }>(
    "/api/transacoes/adicionar",
    {
      preHandler: [
        autenticarTokenFastify,
        validarTransacaoFastify
      ],
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Adicionar uma nova transação",
        description: "Cria uma nova transação financeira para o usuário autenticado.",
        tags: ["Transações"],
        body: {
          type: "object",
          required: ["title", "amount", "date", "type"],
          properties: {
            title: {
              type: "string",
              maxLength: 100,
              description: "Título principal da transação",
              examples: ["Salário"]
            },
            description: {
              type: "string",
              maxLength: 255,
              description: "Descrição complementar da transação",
              examples: ["Pagamento mensal da empresa"]
            },
            amount: {
              type: "number",
              description:
                "Valor da transação"
            },
            date: {
              type: "string",
              format: "date-time",
              description:
                "Data da transação no formato ISO"
            },
            type: {
              type: "string",
              enum: ["INCOME", "EXPENSE"],
              description:
                "Tipo da transação"
            },
            category: {
              type: "string",
              enum: [
                "SALARY",
                "FREELANCE",
                "DIVIDENDS",
                "CASHBACK",
                "BONUS",
                "FOOD",
                "TRANSPORT",
                "HEALTH",
                "EDUCATION",
                "ENTERTAINMENT",
                "HOUSING",
                "UTILITIES",
                "OTHER"
              ],
              description:
                "Categoria da transação"
            },
            isRecurring: {
              type: "boolean",
              default: false,
              description:
                "Define se a transação é recorrente"
            }
          },
          examples: [
            {
              title: "Salário",
              description: "Pagamento mensal",
              amount: 3000.00,
              date: "2026-05-05T00:00:00.000Z",
              type: "INCOME",
              category: "SALARY",
              isRecurring: true
            },
            {
              title: "Conta de Luz",
              description: "Energia elétrica",
              amount: 150.50,
              date: "2026-05-10T00:00:00.000Z",
              type: "EXPENSE",
              category: "UTILITIES",
              isRecurring: true
            }
          ]
        },
        response: {
          201: {
            description: "Transação criada com sucesso",
            type: "object",
            properties: {
              message: {
                type: "string",
                example: ["Transação adicionada com sucesso."]
              },
              transactionId: {
                type: "string",
                example: ["6820bf0d47a66cb77f7b11f4"]
              }
            }
          },
          400: {
            description: "Requisição inválida",
            type: "object",
            properties: {
              error: {
                type: "string"
              }
            }
          },
          401: {
            description: "Não autorizado",
            type: "object",
            properties: {
              error: {
                type: "string"
              }
            }
          },
          422: {
            description: "Erro de validação",
            type: "object",
            properties: {
              error: {
                type: "string"
              }
            }
          }
        }
      }
    },
    createTransactionFastify
  );
  app.get(
    "/api/transacoes/extrato",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        security: [
          { bearerAuth: [] }
        ],
        summary: "Consultar extrato financeiro",
        description: "Retorna saldo, resumo financeiro e movimentações do usuário.",
        tags: ["Transações"],
      },
    },
    getStatementFastify
  );
  app.put<{
    Params: TransactionParamsDto;
    Body: UpdateTransactionRequestDto;
  }>(
    "/api/transacoes/alterar/:id",
    {
      preHandler: [autenticarTokenFastify, validarAtualizacaoTransacaoFastify],
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Atualizar uma transação existente",
        description: "Atualiza os detalhes de uma transação específica pelo seu ID. Apenas o usuário proprietário pode alterar a transação.",
        tags: ["Transações"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", pattern: "^[a-fA-F0-9]{24}$", description: "ID da transação a ser atualizada." },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            description: { type: "string", description: "Nova descrição da transação.", maxLength: 255 },
            amount: { type: "number", description: "Novo valor da transação." },
            date: { type: "string", format: "date", description: "Nova data e hora da transação. (YYYY-MM-DD ou ISO)" },
            type: { type: "string", enum: ["ENTRADA", "SAIDA"], description: "Novo tipo da transação." },
          },
        },
        response: {
          200: { type: "object", properties: { message: { type: "string", example: ["Transação atualizada com sucesso."] } } },
          400: { description: "Requisição inválida", type: "object", properties: { error: { type: "string" } } },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
          404: { description: "Transação não encontrada", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    updateTransactionFastify
  );
  app.delete<{ Params: TransactionParamsDto }>(
    "/api/transacoes/cancelar-transacao/:id",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Cancelar uma transação",
        description: "Remove uma transação específica pelo seu ID. Apenas o usuário proprietário pode cancelar a transação.",
        tags: ["Transações"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", pattern: "^[a-fA-F0-9]{24}$", description: "ID da transação a ser cancelada." },
          },
          required: ["id"],
        },
        response: {
          200: { type: "object", properties: { message: { type: "string", example: ["Transação cancelada com sucesso."] } } },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
          404: { description: "Transação não encontrada", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    deleteTransactionFastify
  );
}
