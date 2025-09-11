import { AuthRequest } from "@/domain/middlewares/authMiddleware";
import { NotFoundError } from "@/infraestructure/utils/HttpError";
import { Response } from "express";
import * as despService from "@/domain/services/despesaService";

export async function Despesas(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  if (!usuarioId) return NotFoundError;

  const despesas = await despService.verificarTotalDespesas(usuarioId);
  return res.status(200).json(despesas);
}

export async function AdicionarDespesa(req: AuthRequest, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return NotFoundError;

    const {
      valor,
      categoria,
      descricao,
      dataVencimento,
      dataAgendamento
    } = req.body;

    const novaDespesa = await despService.criarDespesa({
      valor,
      categoria,
      descricao,
      usuarioId,
      dataVencimento: dataVencimento ? new Date(Date.now()) : new Date(),
      dataAgendamento: dataAgendamento ? new Date(dataAgendamento) : null
    });

    return res.status(201).json(novaDespesa);
  }
  catch (err: any) {
    return res.status(500).json({ error: err.message || "Erro interno no servidor." });
  }
}

export function DespesasAgendadas(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  if (!usuarioId) return NotFoundError;

  const despesasAgendadas = despService.listarDespesasAgendadas(usuarioId);
  return res.status(200).json(despesasAgendadas);
}

export async function DespesaPorId(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  if (!usuarioId) return NotFoundError;

  const { id } = req.params;
  const despesa = await despService.listarDespesas(usuarioId);

  const despesaEncontrada = despesa.find(d => d.id === id);
  if (!despesaEncontrada) return NotFoundError;

  return res.status(200).json(despesaEncontrada);
}
