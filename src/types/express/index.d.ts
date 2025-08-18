import { Request } from "express";

declare module "express" {
  interface Request {
    user?: {
      usuarioId: string;
    };
  }
}
