import { FastifyReply, FastifyRequest } from "fastify";
import type {
  LoginUserRequestDto,
  RegisterUserRequestDto,
  UpdateUserEmailRequestDto,
  UpdateUserPasswordRequestDto,
} from "@application/dto/usuario/index.js";
import { criarUsuarioUseCases } from "@application/use-cases/index.js";
import { ApplicationError } from "@application/errors/ApplicationError.js";
import { usuarioRepository } from "@adapters/database/repositories/usuarioRepository.js";
import { AuthenticatedUser } from "../middlewares/authMiddleware.js";

const usuarioUseCases = criarUsuarioUseCases(usuarioRepository);

interface HttpJsonResponse {
  status(code: number): {
    json(payload: unknown): unknown;
  };
}

interface HttpRequestWithBody<TBody> {
  body: TBody;
  user?: AuthenticatedUser;
}

function sendHttpError(
  response: HttpJsonResponse,
  error: unknown
) {
  if (error instanceof ApplicationError) {
    return response
      .status(error.statusCode)
      .json({ error: error.message });
  }

  if (error instanceof Error) {
    return response.status(500).json({
      error: error.message
    });
  }

  return response.status(500).json({
    error: "Erro interno inesperado."
  });
}

function sendFastifyError(
  reply: FastifyReply,
  error: unknown
) {
  if (error instanceof ApplicationError) {
    return reply.status(error.statusCode).send({
      error: error.message
    });
  }

  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }

  return reply.status(500).send({
    error: "Erro interno inesperado."
  });
}

async function registerUser(body: RegisterUserRequestDto) {
  return usuarioUseCases.cadastrar(body.nome, body.email, body.senha);
}

async function loginUser(body: LoginUserRequestDto) {
  return usuarioUseCases.logar(body.email, body.senha);
}

async function changeUserEmail(body: UpdateUserEmailRequestDto) {
  return usuarioUseCases.alterarEmail(body.emailAntigo, body.emailNovo);
}

async function changeUserPassword(body: UpdateUserPasswordRequestDto) {
  return usuarioUseCases.alterarSenha(
    body.email,
    body.senhaAntiga,
    body.senhaNova
  );
}

async function removeUser(user?: AuthenticatedUser) {
  return usuarioUseCases.remover(String(user?.usuarioId));
}

export async function registerUserHandler(
  request: HttpRequestWithBody<RegisterUserRequestDto>,
  response: HttpJsonResponse
) {
  try {
    const createdUser = await registerUser(request.body);
    return response.status(200).json(createdUser);
  } catch (error) {
    return sendHttpError(response, error);
  }
}

export async function loginUserHandler(
  request: HttpRequestWithBody<LoginUserRequestDto>,
  response: HttpJsonResponse
) {
  try {
    const authenticatedUser = await loginUser(request.body);
    return response.status(200).json(authenticatedUser);
  } catch (error) {
    return sendHttpError(response, error);
  }
}

export async function updateUserEmailHandler(
  request: HttpRequestWithBody<UpdateUserEmailRequestDto>,
  response: HttpJsonResponse
) {
  try {
    const updatedEmail = await changeUserEmail(request.body);
    return response.status(200).json(updatedEmail);
  } catch (error) {
    return sendHttpError(response, error);
  }
}

export async function updateUserPasswordHandler(
  request: HttpRequestWithBody<UpdateUserPasswordRequestDto>,
  response: HttpJsonResponse
) {
  try {
    const updatedPassword = await changeUserPassword(request.body);
    return response.status(200).json(updatedPassword);
  } catch (error) {
    return sendHttpError(response, error);
  }
}

export async function deleteUserHandler(
  request: { user?: AuthenticatedUser },
  response: HttpJsonResponse
) {
  try {
    const deletedUser = await removeUser(request.user);
    return response.status(200).json(deletedUser);
  } catch (error) {
    return sendHttpError(response, error);
  }
}

export async function registerUserFastify(
  request: FastifyRequest<{ Body: RegisterUserRequestDto }>,
  reply: FastifyReply
) {
  try {
    const createdUser = await registerUser(request.body);
    return reply.status(200).send(createdUser);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function loginUserFastify(
  request: FastifyRequest<{ Body: LoginUserRequestDto }>,
  reply: FastifyReply
) {
  try {
    const authenticatedUser = await loginUser(request.body);
    return reply.status(200).send(authenticatedUser);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function updateUserEmailFastify(
  request: FastifyRequest<{ Body: UpdateUserEmailRequestDto }>,
  reply: FastifyReply
) {
  try {
    const updatedEmail = await changeUserEmail(request.body);
    return reply.status(200).send(updatedEmail);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function updateUserPasswordFastify(
  request: FastifyRequest<{ Body: UpdateUserPasswordRequestDto }>,
  reply: FastifyReply
) {
  try {
    const updatedPassword = await changeUserPassword(request.body);
    return reply.status(200).send(updatedPassword);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export async function deleteUserFastify(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const deletedUser = await removeUser(request.user);
    return reply.status(200).send(deletedUser);
  } catch (error) {
    return sendFastifyError(reply, error);
  }
}

export const cadastro = registerUserHandler;
export const login = loginUserHandler;
export const alterarEmail = updateUserEmailHandler;
export const alterarSenha = updateUserPasswordHandler;
export const removerUsuario = deleteUserHandler;
