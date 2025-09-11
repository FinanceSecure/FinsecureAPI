import { AuthRequest } from "@/domain/middlewares/authMiddleware";
import { NotFoundError } from "@/infraestructure/utils/HttpError";
import { Response } from "express";
import { verificarDespesas } from "@/domain/services/despesasService";

export async function Despesas(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  if (!usuarioId) return NotFoundError;

  const despesas = await verificarDespesas(usuarioId);
  return res.status(200).json(despesas);
}
