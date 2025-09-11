import prisma from "@/adapters/database/db";

export async function verificarDespesas(usuarioId: string) {
  const despesas = await prisma.despesas.findMany({
    where: { usuarioId },
  });

  return { despesas };
}

export async function despesasAgendadas(usuarioId: string) {
  return prisma.despesas.findMany({
    where: {
      usuarioId,
      dataAgendamento: {
        gte: new Date(),
      }
    }
  });
}
