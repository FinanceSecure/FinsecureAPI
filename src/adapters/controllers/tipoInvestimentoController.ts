import { 
  acrescentartipoInvestimento, 
  visualizarTipoInvestimento
} from "@/domain/services/tipoInvestimentoService";
import { Request, Response } from "express";

export async function adicionarTipoInvestimento(req: Request, res: Response) {
  try {
    const { nome, tipo, valorPercentual, impostoRenda } = req.body;

    if (!nome) return res.status(404).json({ message: "Nome nao informado" });
    if (!tipo) return res.status(404).json({ message: "Tipo nao informado" });
    if (!valorPercentual) return res.status(404).json({ message: "Valor percentual nao informado" });

    const tipoAdicionado = await acrescentartipoInvestimento(
      nome,
      tipo,
      valorPercentual,
      impostoRenda
    );
    res.status(201).json(tipoAdicionado);
  } catch (err) {
    res.status(500).json({ message: "Falha no servidor" });
  }
}

export async function verificarTipoInvestimento(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const tipoInvestimentoId = req.params.id;

    if (!usuarioId)
      return res.status(401).json({ message: "Usuário não autenticado." });

    if (!tipoInvestimentoId)
      return res.status(400).json({ message: "ID de investimento inválido." });

    const tipoInvestido = await visualizarTipoInvestimento(tipoInvestimentoId);

    if (!tipoInvestido)
      return res.status(404).json({ message: "Investimento não encontrado." });

    return res.status(200).json(tipoInvestido);
  } catch (err: any) {
    return res.status(500).json({ erro: err.message || "Falha no servidor." });
  }
}
