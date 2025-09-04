import { NextFunction, Request, Response } from "express";
import { HttpError } from "@/infraestructure/utils/HttpError";

export function erroMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HttpError)
    return res.status(err.status).json({ error: err.message });

  if (err instanceof Error)
    return res.status(500).json({ error: err.message });

  return res.status(500).json({ error: "Erro interno inesperado. " });
}
