import prisma from "../../db";

export async function atualizarSaldoUsuario(usuarioId: number): Promise<number> {
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

export async function visualizarSaldo(usuarioId: number, saldoId: number) {
  const saldo = await prisma.saldo.findFirst({
    where: {
      id: saldoId,
      usuarioId
    }
  });

  if (!saldo)
    throw new Error("Saldo não encontrado")

  return saldo;
}
