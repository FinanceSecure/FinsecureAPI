import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient;

export async function atualizarSaldoUsuario(usuarioId: number): Promise<number> {
  const saldoTotal = await prisma.transacao.aggregate({
    _sum: { valor: true }, where: { usuario_id: usuarioId }
  });

  const saldoAtualizado = saldoTotal._sum.valor || 0;
  const saldoExistente = await prisma.saldo.findFirst({ where: { usuario_id: usuarioId } })

  saldoExistente
    ? await prisma.saldo.update({ where: { id: saldoExistente.id }, data: { valor: saldoAtualizado } })
    : await prisma.saldo.create({ data: { usuario_id: usuarioId, valor: saldoAtualizado } });

  return saldoAtualizado;
}