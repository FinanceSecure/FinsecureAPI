import { Request, Response } from "express";
import {
  adicionarInvestimento,
  consultarInvestimentosPorTipo
} from "@/domain/services/investimentoService";
import { resgatarInvestimento } from "@/application/use-cases/resgatarInvestimento";

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
    res.status(500).json({ message: err.message || "Erro no servidor" });
  }
}

export async function extrato(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const investimentoId = req.params.id;

    if (!usuarioId)
      return res.status(401).json({ message: "Usuário não autenticado" });
    if (!investimentoId)
      return res.status(404).json({ message: "ID invalido." });

    const extrato = await consultarInvestimentosPorTipo(
      usuarioId,
      investimentoId
    );

    return res.status(200).json(extrato);
  }
  catch (err: any) {
    return res.status(500).json({ error: err.message || "Erro interno no sevidor." });
  }
}

export async function resgatar(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    const tipoInvestimentoId = req.params.id;
    const valorParaResgatar = Number(req.body.valor);

    if (!usuarioId)
      return res.status(401).json({ message: "Usuário não autenticado." });

    if (!tipoInvestimentoId)
      return res.status(404).json({ message: "Id invalido" })

    if (!valorParaResgatar || isNaN(valorParaResgatar))
      return res.status(404).json({ message: "Valor invalido" })

    const resultado = await resgatarInvestimento(
      usuarioId,
      tipoInvestimentoId,
      valorParaResgatar
    )

    return res.status(200).json(resultado);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Erro no servidor." })
  }
}
