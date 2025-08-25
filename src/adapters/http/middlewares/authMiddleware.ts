import {
  Request,
  Response,
  NextFunction
} from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  usuarioId: string;
  primeiro_nome: string;
  ultimo_nome: string;
  iat: number;
  exp: number;
}

export function autenticarToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = { usuarioId: decoded.usuarioId }

    next();
  } catch (error) {
    res.status(403).json({ error: "Token inválido" });
  }
}
