import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import type {
  CreateTransactionRequestDto,
  TransactionParamsDto,
  UpdateTransactionRequestDto,
} from "@application/dto/transacao/index.js";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import { validarTransacaoFastify } from "../middlewares/validarTransacaoMiddleware.js";
import {
  createTransactionFastify,
  deleteTransactionFastify,
  updateTransactionFastify,
} from "../controllers/transacaoController.js";

export async function registerTransactionRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateTransactionRequestDto }>(
    "/api/transacoes/adicionar",
    {
      preHandler: [autenticarTokenFastify, validarTransacaoFastify],
      schema: {
        security: [{ bearerAuth: [] }], // Esta rota requer autenticação
        summary: "Adicionar uma nova transação",
        description: "Cria uma nova transação (entrada ou saída) para o usuário autenticado. O status da transação (PENDENTE/EFETIVADA) é determinado automaticamente pela data.",
        tags: ["Transações"], // Agrupa a rota sob a tag "Transações" no Swagger UI
        body: {
          type: "object",
          required: ["descricao", "valor", "data", "tipo"],
          properties: {
            descricao: {
              type: "string",
              description: "Descrição da transação",
              maxLength: 255,
            },
            valor: {
              type: "number",
              description: "Valor da transação. Deve ser positivo para ENTRADA e negativo para SAIDA.",
            },
            data: {
              type: "string",
              format: "date-time",
              description: "Data e hora da transação no formato ISO 8601 (ex: '2023-10-27T10:30:00Z').",
            },
            tipo: {
              type: "string",
              enum: ["ENTRADA", "SAIDA"],
              description: "Tipo da transação: 'ENTRADA' para receitas, 'SAIDA' para despesas.",
            },
          },
          examples: [
            {
              descricao: "Salário Mensal",
              valor: 3000.00,
              data: "2023-10-27T09:00:00Z",
              tipo: "ENTRADA",
            },
            {
              descricao: "Conta de Luz",
              valor: -150.50,
              data: "2023-10-27T15:00:00Z",
              tipo: "SAIDA",
            },
          ],
        },
        response: {
          201: {
            description: "Transação criada com sucesso",
            type: "object",
            properties: {
              message: { type: "string", example: "Transação adicionada com sucesso." },
              transactionId: { type: "string", format: "uuid", example: "a1b2c3d4-e5f6-7890-1234-567890abcdef" },
            },
          },
          400: { description: "Requisição inválida", type: "object", properties: { error: { type: "string" } } },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
          422: { description: "Erro de validação", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    createTransactionFastify
  );
  app.put<{
    Params: TransactionParamsDto;
    Body: UpdateTransactionRequestDto;
  }>(
    "/api/transacoes/alterar/:id",
    {
      preHandler: [autenticarTokenFastify, validarTransacaoFastify],
      schema: {
        security: [{ bearerAuth: [] }],
        summary: "Atualizar uma transação existente",
        description: "Atualiza os detalhes de uma transação específica pelo seu ID. Apenas o usuário proprietário pode alterar a transação.",
        tags: ["Transações"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", description: "ID da transação a ser atualizada." },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            descricao: { type: "string", description: "Nova descrição da transação.", maxLength: 255 },
            valor: { type: "number", description: "Novo valor da transação." },
            data: { type: "string", format: "date-time", description: "Nova data e hora da transação." },
            tipo: { type: "string", enum: ["ENTRADA", "SAIDA"], description: "Novo tipo da transação." },
          },
        },
        response: {
          200: { type: "object", properties: { message: { type: "string", example: "Transação atualizada com sucesso." } } },
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
            id: { type: "string", format: "uuid", description: "ID da transação a ser cancelada." },
          },
          required: ["id"],
        },
        response: {
          200: { type: "object", properties: { message: { type: "string", example: "Transação cancelada com sucesso." } } },
          401: { description: "Não autorizado", type: "object", properties: { error: { type: "string" } } },
          404: { description: "Transação não encontrada", type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    deleteTransactionFastify
  );
}
