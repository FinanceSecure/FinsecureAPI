import prisma from "@/adapters/database/db";
import { calcularValorTotalInvestido } from "@/infraestructure/utils/CalcularInvestimentos";

export async function verificarReceitas(usuarioId: string) {
  const rendaFixa = await prisma.rendaFixa.findMany({
    where: { usuarioId },
  });

  const rendaVariavel = await prisma.rendaVariavel.findMany({
    where: { usuarioId }
  });

  return {
    rendaFixa,
    rendaVariavel
  };
};

export async function verificarRendaFixa(usuarioId: string) {
  const rendaFixa = await prisma.rendaFixa.findUnique({
    where: { usuarioId }
  })

  return { rendaFixa };
}

export async function verificarTotalRendaVariavel(usuarioId: string) {
  const investimentos = await prisma.investimento.findMany({
    where: { usuarioId },
    include: {
      aplicacoes: true,
      tipoInvestimento: true,
    }
  });

  const valorTotalInvestido = calcularValorTotalInvestido(investimentos);

  return {
    valorTotalInvestido: valorTotalInvestido,
    investimentos: investimentos
  };
};
