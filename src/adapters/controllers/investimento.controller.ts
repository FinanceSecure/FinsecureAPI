import { json, Request, Response } from "express";
import {
  adicionarInvestimento,
  consultarInvestimentosTipo,
  encontrarInvestimento,
  listarInvestimentos,
  resgatarInvestimento
} from "../../application/services/investimento.service";

export async function buscarInvestimento(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const investimentoId = Number(req.params.id);

    if (!usuarioId)
      return res.status(404).json({ message: "usuario nao encontrado" });

    const saldo = await encontrarInvestimento(usuarioId, investimentoId);

    return res.status(200).json(saldo)
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Erro interno no servidor" });
  }
}

export async function listarInvestimentosController(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId)
      return res.status(401).json({ message: "Usuário não autenticado." })

    const lista = await listarInvestimentos(usuarioId);
    return res.status(200).json(lista);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Erro interno" })
  }
}

export async function consultarPorTipo(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const tipoInvesitmentoId = Number(req.params.tipoInvestimentoId);

    if (!usuarioId) {
      return res.status(401).json({ message: "Não autenticado." });
    }
    if (!tipoInvesitmentoId || isNaN(tipoInvesitmentoId)) {
      return res.status(400).json({ message: "Tipo investimento inválido." });
    }

    const resultado = await consultarInvestimentosTipo(usuarioId, tipoInvesitmentoId);
    return res.status(202).json(resultado);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Falha no servidor." })
  }
}

export async function investir(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const {
      tipoInvestimentoId,
      valorInvestido,
      dataCompra,
      dataAtualizacao
    } = req.body;

    if (!usuarioId)
      return res.status(401).json({ message: "Uusario não autenticado." });

    const parsedDataCompra = new Date(dataCompra);
    const parsedDataAtualizacao = dataAtualizacao
      ? new Date(dataAtualizacao)
      : undefined;

    const investimento = await adicionarInvestimento(
      usuarioId,
      tipoInvestimentoId,
      valorInvestido,
      parsedDataCompra,
      parsedDataAtualizacao
    );
    res.status(201).json(investimento)
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Erro no servidor" });
  }
}

export async function resgatar(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const { tipoInvestimentoId, valorParaResgatar } = req.body;

    if (!usuarioId)
      return res.status(401).json({ message: "Uusuário não autenticado." });

    if (!tipoInvestimentoId || isNaN(tipoInvestimentoId) ||
      !valorParaResgatar || isNaN(valorParaResgatar)) {
      return res.status(400).json({ message: "Uusuário não autenticado." });
    }
    const resultado = await resgatarInvestimento
      (usuarioId,
        Number(tipoInvestimentoId),
        Number(valorParaResgatar)
      );

    return res.status(200).json(resultado);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Falha no servidor" })
  }
}
