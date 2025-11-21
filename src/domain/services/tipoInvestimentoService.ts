import prisma from "@adapters/database/db";

export async function acrescentartipoInvestimento(
  nome: string,
  tipo: string,
  valorPercentual: number,
  impostoRenda: boolean
) {
  const tipoInvestimento = await prisma.tipoInvestimento.create({
    data: {
      nome,
      tipo,
      valorPercentual,
      impostoRenda,
    },
  });

  return tipoInvestimento;
}

export async function visualizarTipoInvestimento(id: string) {
  const tipoInvestimento = await prisma.tipoInvestimento.findFirst({
    where: { id },
  });

  return tipoInvestimento;
}
