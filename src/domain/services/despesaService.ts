import prisma from "@adapters/database/db";
import { calcularTotalDespesas } from "@domain/utils/calcDespesas";

export function listarDespesas(usuarioId: string) {
  return prisma.despesas.findMany({
    where: { usuarioId },
    orderBy: { dataVencimento: 'desc' }
  });
}

export async function criarDespesa(despesaData: {
  valor: number;
  dataVencimento: Date | null;
  categoria: string;
  descricao: string;
  dataAgendamento?: Date | null;
  usuarioId: string;
}) {
  return prisma.despesas.create({
    data: despesaData,
  });
}

export async function listarDespesasAgendadas(usuarioId: string) {
  return prisma.despesas.findMany({
    where: {
      usuarioId,
      dataAgendamento: {
        gte: new Date(),
      }
    }
  });
}

export async function verificarTotalDespesas(usuarioId: string) {
  const despesas = await prisma.despesas.findMany({
    where: { usuarioId },
  });
  const totalDespesas = calcularTotalDespesas(despesas);

  return {
    totalDespesas: totalDespesas,
    detalhes: { despesas }
  };
}
