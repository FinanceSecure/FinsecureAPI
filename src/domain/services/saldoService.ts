import { ObjectId } from "mongodb";
import prisma from "@adapters/database/db";

export async function atualizarSaldoUsuario(usuarioId: string) {
  const totalTransacoes = await prisma.transacao.aggregate({
    _sum: { valor: true },
    where: { usuarioId, status: "EFETIVADA" }
  });
  const totalTransacoesEfetuadas = totalTransacoes._sum.valor || 0;

  const rendaFixa = await prisma.rendaFixa.findMany({ where: { usuarioId } });
  const rendaVariavel = await prisma.rendaVariavel.findMany({ where: { usuarioId } });
  const totalRendaFixa = rendaFixa.reduce((T, R) => T + R.valor, 0);
  const totalRendaVariavel = rendaVariavel.reduce((T, R) => T + R.valor, 0);
  const totalReceitas = totalRendaFixa + totalRendaVariavel;

  const despesas = await prisma.despesas.findMany({ where: { usuarioId } });
  const totalDespesas = despesas.reduce((T, D) => T + D.valor, 0);

  const saldoAtualizado = totalReceitas + totalTransacoesEfetuadas - totalDespesas;
  const saldoExistente = await prisma.saldo.findFirst({
    where: { usuarioId },
  });

  saldoExistente
    ? await prisma.saldo.update({
      where: { id: saldoExistente.id },
      data: { valor: saldoAtualizado },
    })
    : await prisma.saldo.create({
      data: {
        usuarioId,
        valor: saldoAtualizado,
      },
    });

  return saldoAtualizado;
}

export async function visualizarSaldo(usuarioId: string) {
  if (!ObjectId.isValid(usuarioId)) throw new Error("ID Invalido");

  const saldo = await prisma.saldo.findFirst({
    where: {
      usuarioId,
    },
  });

  if (!saldo) throw new Error("Saldo nao encontrado.");

  return saldo;
}
