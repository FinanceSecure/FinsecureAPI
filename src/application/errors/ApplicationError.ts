export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ResourceNotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, 404);
  }
}
