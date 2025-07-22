import prisma from "../../db";

export async function adicionarInvestimento(
  usuarioId: number,
  tipoInvestimentoId: number,
  valorInvestido: number,
  dataCompra: Date
) {

  if (!usuarioId)
    throw new Error("Usuário não autenticado");

  if (!tipoInvestimentoId)
    throw new Error("Tipo de investimento não informado.");

  if (!valorInvestido)
    throw new Error("Valor investido não informado.");

  if (!dataCompra)
    throw new Error("Data de compra não informada.");

  const tipo = await prisma.tipoInvestimento.findUnique({
    where: { id: tipoInvestimentoId }
  })

  if (!tipo)
    throw new Error("Tipo de investimento não encontrado.");

  const investimento = await prisma.investimento.create({
    data: {
      usuarioId,
      tipoInvestimentoId,
      valorInvestido,
      dataCompra,
      rendimentoAcumulado: 0
    },
    include: {
      tipoInvestimento: true
    }
  });

  return investimento;
}

export async function encontrarInvestimento(
  usuarioId: number,
  investimentoId: number
) {
  const investimento = await prisma.investimento.findFirst({
    where: {
      id: investimentoId,
      usuarioId
    }
  });

  if (!investimento)
    throw new Error("Investimento não encontrado!");

  return investimento;
}

export async function encontrarInvestimentos(usuarioId: number) {
  const investimentos = await prisma.investimento.findMany({
    where: { usuarioId }
  });

  if (!investimentos)
    throw new Error("Não foi possível encontrar investimentos!");

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
