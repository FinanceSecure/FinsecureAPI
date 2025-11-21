import { AuthRequest } from "@adapters/http/middlewares/authMiddleware";
import { NotFoundError } from "@adapters/api/exceptions/HttpError";
import { Request, Response } from "express";
import * as ReceitaService from "@domain/services/receitaService";

export async function Receitas(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  if (!usuarioId) return NotFoundError;

  const receitas = await ReceitaService.verificarReceitas(usuarioId);
  return res.status(200).json(receitas);
}

export async function ReceitaRendaFixa(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  if (!usuarioId) return NotFoundError;

  const rendaFixa = await ReceitaService.verificarRendaFixa(usuarioId);
  return res.status(200).json(rendaFixa);
}

export async function AdicionarReceitaRendaFixa(req: AuthRequest, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return NotFoundError;

    const { valor } = req.body;
    const novaRendaFixa = await ReceitaService.adicionarRendaFixa({
      usuarioId,
      valor
    });

    return res.status(201).json(novaRendaFixa);
  } catch (err: any) {
    return res.status(500).json(
      { message: err.message || "Erro no servidor." }
    );
  }
}

export async function AlterarReceitaRendaFixa(req: AuthRequest, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return NotFoundError;

    const { valor } = req.body;
    const rendaFixaAlterada = await ReceitaService.alterarRendaFixa({
      usuarioId,
      valor
    });
    return res.status(200).json(rendaFixaAlterada);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Erro no servidor."
    });
  }
}

export async function RemoverRendaFixa(req: AuthRequest, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return NotFoundError;

    const rendaFixaRemovida = await ReceitaService.removerRendaFixa(usuarioId);

    return res.status(200).json({
      message: "Renda fixa removida com sucesso.",
      rendaFixaRemovida
    });
  } catch (err: any) {
    return res.status(500).json(
      { message: err.message || "Erro no servidor." }
    );
  }
}

export async function ReceitaVariavel(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  if (!usuarioId) return NotFoundError;

  const rendaVariavel = await ReceitaService.verificarRendaVariavel(usuarioId);

  return res.status(200).json(rendaVariavel);
}

export async function AdicionarReceitaRendaVariavel(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return NotFoundError;
    const { descricao, valor } = req.body;

    const novaRendaVariavel = await ReceitaService.adicionarRendaVariavel({
      usuarioId,
      descricao,
      valor
    });

    return res.status(201).json(novaRendaVariavel);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Erro no servidor." });
  }
}

export async function AlterarRendaVariavel(req: Request, res: Response) {
  try {
    const { id, descricao, valor } = req.body;
    if (!id) throw new Error("ID não encontrado.")

    const rendaVariavelAlterada = await ReceitaService.alterarRendaVariavel({
      id,
      descricao,
      valor
    });

    return res.status(200).json(rendaVariavelAlterada);
  } catch (err: any) {
    return res.status(500).json(
      { message: err.message || "Erro no servidor." }
    );
  }
}

export async function RemoverRendaVariavel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const rendaVariavelRemovida = await ReceitaService.removerRendaVariavel(id);

    return res.status(200).json({
      message: "Renda variável removida com sucesso.",
      rendaVariavelRemovida
    });
  } catch (err: any) {
    return res.status(500).json(
      { message: err.message || "Erro no servidor." }
    );
  }
}