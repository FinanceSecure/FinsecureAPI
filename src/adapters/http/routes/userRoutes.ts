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
      schema: {
        summary: "Cadastrar novo usuário",
        tags: ["Usuários"],
        security: [],

        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
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
      schema: {
        summary: "Realizar login",
        tags: ["Usuários"],
        security: [],

        body: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
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
            oldEmail: { type: "string", format: "email" },
            newEmail: { type: "string", format: "email" },
          },
          required: ['oldEmail', 'newEmail'],
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
            oldPassword: { type: "string", minLength: 8 },
            newPassword: { type: "string", minLength: 8 },
          },
          required: ['email', 'oldPassword', 'newPassword'],
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
