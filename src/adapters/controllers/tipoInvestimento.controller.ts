import { Request, Response } from "express"
import {
  acrescentartipoInvestimento,
  visualizarTipoInvestimento
} from "../../application/services/tipoInvestimento.service";

export async function adicionarTipoInvestimento(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const { nome, tipo, valorPercentual } = req.body;

    if (!nome)
      return res.status(404).json({ message: "Nome nao informado" })

    if (!tipo)
      return res.status(404).json({ message: "Tipo nao informado" })

    if (!valorPercentual)
      return res.status(404).json({ message: "Valor percentual nao informado" })

    if (!usuarioId)
      throw new Error("Usuário não autenticado");

    await acrescentartipoInvestimento(req, res);
  } catch (err) {
    throw new Error("Falha no servidor")
  }
}

export async function verificarTipoInvestimento(req: Request, res: Response) {
  const usuarioId = req.user?.usuarioId;
  const tipoInvestimentoId = Number(req.params.id);

  if (!usuarioId)
    return res.status(404).json({ message: "usuario nao encontrado" })

  const tipoInvestido = await visualizarTipoInvestimento(tipoInvestimentoId);

  if (!tipoInvestido)
    res.status(404).json("Investimento não encontrado.")

  return res.status(200).json(tipoInvestido)
}
