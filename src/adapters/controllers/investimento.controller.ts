import { Request, Response } from "express";
import {
  adicionarInvestimento,
  encontrarInvestimento,
  encontrarInvestimentos,
  resgatarInvestimento
} from "../../application/services/investimento.service";

export async function investir(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;

    if (!usuarioId) throw new Error("Usuário não autenticado");

    await adicionarInvestimento(req, res)
  } catch (err) {
    res.status(500).json({ message: "Falha no servidor" });
  }
}

export async function buscarInvestimento(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const investimentoId = Number(req.params.id);

    if (!usuarioId)
      return res.status(404).json({ message: "usuario nao encontrado" })

    const saldo = await encontrarInvestimento(usuarioId, investimentoId);

    return res.status(200).json(saldo)
  } catch (err) {
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}

export async function buscarInvestimentos(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;

    if (!usuarioId)
      return res.status(404).json({ message: "Usuario não authenticado" });

    const investimentos = await encontrarInvestimentos(usuarioId);

    return res.status(200).json(investimentos);
  } catch (err) {
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}

export async function resgatar(req: Request, res: Response) {
  try {
    const investimentoId = Number(req.params.id);
    const usuarioId = req.user?.usuarioId;

    if (!usuarioId)
      return res.status(401).json({ message: "Uusuário não autenticado." })

    if (!investimentoId || isNaN(investimentoId))
      return res.status(400).json({ message: "Uusuário não autenticado." })

    const resultado = await resgatarInvestimento(usuarioId, investimentoId);

    return res.status(200).json(resultado);
  } catch (err) {
    res.status(500).json({ message: "Falha no servidor" })
  }
}
