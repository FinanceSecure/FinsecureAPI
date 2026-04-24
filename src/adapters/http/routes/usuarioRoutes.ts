import { FastifyInstance } from "fastify";
import "@fastify/swagger";
import { autenticarTokenFastify } from "../middlewares/authMiddleware.js";
import type {
  LoginUserRequestDto,
  RegisterUserRequestDto,
  UpdateUserEmailRequestDto,
  UpdateUserPasswordRequestDto,
} from "@application/dto/usuario/index.js";
import {
  deleteUserFastify,
  loginUserFastify,
  registerUserFastify,
  updateUserEmailFastify,
  updateUserPasswordFastify,
} from "../controllers/usuarioController.js";

export async function registerUserRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterUserRequestDto }>(
    "/api/usuarios/cadastrar",
    {
      schema: {
        summary: "Cadastrar novo usuário",
        tags: ["Usuários"],
        security: [], // Aberto ao público
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
        security: [], // Aberto ao público
      },
    },
    loginUserFastify
  );
  app.post<{ Body: UpdateUserEmailRequestDto }>(
    "/api/usuarios/alterar-email",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Alterar e-mail do usuário",
        tags: ["Usuários"],
        security: [{ bearerAuth: [] }],
      },
    },
    updateUserEmailFastify
  );
  app.post<{ Body: UpdateUserPasswordRequestDto }>(
    "/api/usuarios/alterar-senha",
    {
      preHandler: autenticarTokenFastify,
      schema: {
        summary: "Alterar senha do usuário",
        tags: ["Usuários"],
        security: [{ bearerAuth: [] }],
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
