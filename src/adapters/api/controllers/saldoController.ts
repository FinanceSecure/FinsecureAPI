import { Request, Response } from "express";
import { visualizarSaldo } from "@domain/services/saldoService";
import { NotFoundError } from "../exceptions/HttpError";

export async function verificarSaldo(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return NotFoundError;

    const saldo = await visualizarSaldo(usuarioId);
    return res.status(200).json(saldo);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string"
    ) {
      const errorMessage = (error as any).message;
      if (errorMessage === "Saldo não encontrado") {
        return res.status(404).json({ message: errorMessage });
      }
      console.error("Erro ao buscar salldo: ", errorMessage);
    } else {
      console.error("Erro ao buscar salldo: ", error);
    }
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}
