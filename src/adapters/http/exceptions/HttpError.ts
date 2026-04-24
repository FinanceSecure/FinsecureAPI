export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Requisição inválida") {
    super(message, 400);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Não autorizado") {
    super(message, 401);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
  }
}
