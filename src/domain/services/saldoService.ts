import { ObjectId } from "mongodb";
import prisma from "@/adapters/database/db";
import { NotFoundError } from "@/infraestructure/utils/HttpError";

export async function atualizarSaldoUsuario(usuarioId: string) {
  const saldoTotal = await prisma.transacao.aggregate({
    _sum: { valor: true },
    where: {
      usuarioId: usuarioId,
      status: "EFETIVADA"
    }
  });

  const saldoAtualizado = saldoTotal._sum.valor || 0;
  const saldoExistente = await prisma.saldo.findFirst({
    where: { usuarioId }
  })

  saldoExistente
    ? await prisma.saldo.update({
      where: { id: saldoExistente.id },
      data: { valor: saldoAtualizado }
    })
    : await prisma.saldo.create({
      data: {
        usuarioId,
        valor: saldoAtualizado
      }
    });

  return saldoAtualizado;
}


export async function visualizarSaldo(usuarioId: string) {
  if (!ObjectId.isValid(usuarioId)) throw new Error("ID Invalido");

  const saldo = await prisma.saldo.findFirst({
    where: {
      usuarioId
    }
  });

  if (!saldo) throw new Error("Saldo nao encontrado.");

  return saldo;
}

export async function visualizarSaldoComDespesas(usuarioId: string) {
  if (!ObjectId.isValid(usuarioId)) return NotFoundError;

  const saldo = await prisma.saldo.findFirst({ where: { usuarioId } });
  if (!saldo) throw new Error("Saldo não encontrado.");

  const despesas = await prisma.despesas.findMany({ where: { usuarioId } });
  const totalDespesas = despesas.reduce(
    (total, despesas) => total + despesas.valor, 0
  );

  return {
    receitas: saldo.valor,
    despesas: totalDespesas,
    saldoFinal: saldo.valor - totalDespesas
  };
}
