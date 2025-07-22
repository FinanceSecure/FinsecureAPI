import prisma from "../../db";

export async function acrescentartipoInvestimento(
  nome: string,
  tipo: string,
  valorPercentual: number
) {

  const tipoInvestimento = await prisma.tipoInvestimento.create({
    data: {
      nome,
      tipo,
      valorPercentual
    }
  });

  return tipoInvestimento;
}

export async function visualizarTipoInvestimento(id: number) {
  const tipoInvestimento = await prisma.tipoInvestimento.findFirst({
    where: { id }
  });

  return tipoInvestimento;
}
