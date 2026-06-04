import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import type {
  LoginUserRequestDto,
  RegisterUserRequestDto,
  UpdateUserEmailRequestDto,
  UpdateUserPasswordRequestDto,
} from "@/application/dto/user";
import {
  deleteUserFastify,
  loginUserFastify,
  registerUserFastify,
  updateUserEmailFastify,
  updateUserPasswordFastify,
} from "../controllers";

export async function registerUserRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterUserRequestDto }>(
    "/api/usuarios/cadastrar",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
      schema: {
        summary: "Cadastrar novo usuário",
        tags: ["Usuários"],
        security: [],

        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 12, maxLength: 128 },
          },
          required: ['name', 'email', 'password'],
        }
      },
    },
    registerUserFastify
  );

  app.post<{ Body: LoginUserRequestDto }>(
    "/api/usuarios/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
      schema: {
        summary: "Realizar login",
        tags: ["Usuários"],
        security: [],

        body: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string", maxLength: 128 },
          },
          required: ['email', 'password'],
        }
      },
    },
    loginUserFastify
  );

  app.put<{ Body: UpdateUserEmailRequestDto }>(
    "/api/usuarios/alterar-email",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Alterar e-mail do usuário",
        tags: ["Usuários"],
        security: [{ bearerAuth: [] }],

        body: {
          type: "object",
          properties: {
            newEmail: { type: "string", format: "email" },
            oldEmail: { type: "string", format: "email" },
          },
          required: ['newEmail'],
        }
      },
    },
    updateUserEmailFastify
  );

  app.put<{ Body: UpdateUserPasswordRequestDto }>(
    "/api/usuarios/alterar-senha",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Alterar senha do usuário",
        tags: ["Usuários"],
        security: [{ bearerAuth: [] }],

        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            oldPassword: { type: "string", maxLength: 128 },
            newPassword: { type: "string", minLength: 12, maxLength: 128 },
          },
          required: ['oldPassword', 'newPassword'],
        }
      },
    },
    updateUserPasswordFastify
  );

  app.delete(
    "/api/usuarios/apagar-conta",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Apagar conta do usuário",
        tags: ["Usuários"],
        security: [{ bearerAuth: [] }],
      },
    },
    deleteUserFastify
  );
}
