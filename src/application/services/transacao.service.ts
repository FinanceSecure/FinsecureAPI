import { Request, Response } from "express";
import { atualizarSaldoUsuario } from "./saldo.service";
import prisma from "../../db";

export async function adicionarTransacao(req: Request, res: Response) {
  try {
    const {
      descricao,
      valor,
      data,
      tipo,
      status,
      usuarioId
    } = req.body.validated;

    const transacao = await prisma.transacao.create({
      data: {
        descricao,
        valor,
        data,
        tipo,
        status,
        usuarioId
      }
    });

    const saldo = await atualizarSaldoUsuario(usuarioId)

    res.status(201).json({ transacao, saldoAtual: saldo });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar transação" })
  }
}

export async function atualizarTransacao(req: Request, res: Response) {
  try {
    const { descricao, valor, data, tipo, usuarioId } = req.body.validated;
    const id = Number(req.params.id);

    if (!id || isNaN(id))
      return res.status(400).json({ error: "ID da transação inválido" })

    const transacaoAntiga = await prisma.transacao.findFirst({
      where: { id, usuarioId }
    });

    if (!transacaoAntiga)
      return res.status(401).json({ error: "Transação não encontrada ou não pertence a este usuário" })

    const transacaoAtual = await prisma.transacao.update({
      where: { id },
      data: {
        descricao,
        valor,
        data,
        tipo
      }
    });

    return res.status(200).json(transacaoAtual)
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar a transação." })
  }
}

export async function excluirTransacao(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const usuarioId = req.user?.usuarioId;
    const transacao = await prisma.transacao.findFirst({
      where: { id, usuarioId }
    });

    if (!id || isNaN(id))
      return res.status(400).json({ error: "Id da transação inválido" })

    if (!usuarioId)
      return res.status(401).json({ error: "Usuário não authenticado" })

    if (!transacao)
      return res.status(404).json({ error: "Transação não encontrada ou não pertece ao usuário" })

    await prisma.transacao.delete({ where: { id } });
    return res.status(200).json({ message: "Transacao cancelada" });
  }
  catch (err) {
    res.status(500).json({ message: "Falha ao cancelar transacao" });
  }
}

export async function liberarTransacoesPendentes() {
  const hoje = new Date();

  const pendentes = await prisma.transacao.findMany({
    where: {
      status: "PENDENTE",
      data: { lte: hoje }
    }
  });

  for (const transacao of pendentes) {
    await prisma.transacao.update({
      where: { id: transacao.id },
      data: { status: "EFETIVADA" }
    });
    await atualizarSaldoUsuario(transacao.usuarioId);
  }
}
