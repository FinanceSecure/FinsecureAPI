import { Request, Response } from "express"
import prisma from "../../db";

export async function adicionarInvestimento(req: Request, res: Response) {
  try {
    const {
      valorInvestido,
      dataCompra,
      usuarioId = req.user?.usuarioId,
      tipoInvestimentoId,
    } = req.body;

    const tipoInvestimento = await prisma.tipoInvestimento.findUnique({
      where: { id: tipoInvestimentoId }
    })

    if (!tipoInvestimento) {
      return res.status(400).json({ message: "Tipo de investimento não encontrado" })
    }

    const investimento = await prisma.investimento.create({
      data: {
        valorInvestido,
        dataCompra: new Date(dataCompra),
        tipoInvestimentoId,
        usuarioId,
        rendimentoAcumulado: 0,
      },
      include: {
        tipoInvestimento: true,
      }
    });

    res.status(201).json(investimento)
  } catch (err) {
    res.status(500).json({ message: "Falha no servidor" })
  }
}

export async function encontrarInvestimento(usuarioId: number, investimentoId: number) {
  const investimento = await prisma.investimento.findFirst({
    where: {
      id: investimentoId,
      usuarioId
    }
  });

  if (!investimento)
    throw new Error("Investimento não encontrado!")

  return investimento;
}

export async function encontrarInvestimentos(usuarioId: number) {
  const investimentos = await prisma.investimento.findMany({
    where: { usuarioId }
  });

  if (!investimentos)
    throw new Error("Não foi possível encontrar investimentos!")

  return investimentos
}

export async function resgatarInvestimento(usuarioId: number, investimentoId: number) {
  const investimento = await prisma.investimento.findFirst({
    where: { id: investimentoId, usuarioId }
  });

  if (!investimento)
    throw new Error("Investimento não encontrado para este usário")

  const saldoAtual = await prisma.saldo.findUnique({
    where: { usuarioId }
  });

  if (!saldoAtual)
    throw new Error("Não foi possível encontrar saldo")

  const valorResgate = investimento.valorInvestido + investimento.rendimentoAcumulado;

  const novoSaldo = await prisma.saldo.update({
    where: { usuarioId },
    data: {
      valor: saldoAtual.valor + valorResgate,
      atualizado: new Date
    }
  })

  await prisma.investimento.delete({ where: { id: investimentoId } })

  return {
    message: "Investimento resgatado com sucesso",
    saldoAtualizado: novoSaldo
  };
}
