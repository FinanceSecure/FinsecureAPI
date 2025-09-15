import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { usuarioId: string };
}

interface JwtPayload {
  usuarioId: string;
  nome: string;
  iat: number;
  exp: number;
}

export function autenticarToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = { usuarioId: decoded.usuarioId };

    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
}
