import prisma from "@/adapters/database/db";
import { calcularValorTotalInvestido } from "@/infraestructure/utils/CalcularInvestimentos";

export async function verificarReceitas(usuarioId: string) {
  const rendaFixa = await prisma.rendaFixa.findMany({
    where: { usuarioId },
  });
  const rendaVariavel = await prisma.rendaVariavel.findMany({
    where: { usuarioId }
  });
  const investimentos = await prisma.investimento.findMany({
    where: { usuarioId },
    include: {
      aplicacoes: true,
      tipoInvestimento: true,
    }
  });
  const totalRendaFixa = rendaFixa.reduce(
    (total, renda) => total + renda.valor, 0
  );
  const valorTotalInvestido = calcularValorTotalInvestido(investimentos);
  const totalRendaVariavel = rendaVariavel.reduce(
    (total, renda) => total + renda.valor, 0 + valorTotalInvestido
  );
  const totalReceitas = totalRendaFixa + totalRendaVariavel;

  return {
    rendaFixa: totalRendaFixa,
    rendaVariavel: totalRendaVariavel,
    totalReceitas: totalReceitas,
    detalhes: {
      rendaFixa,
      outros: rendaVariavel,
      investimentos
    }
  };
};

export async function verificarRendaFixa(usuarioId: string) {
  const rendaFixa = await prisma.rendaFixa.findUnique({
    where: { usuarioId }
  })

  return { rendaFixa };
}

export async function verificarTotalRendaVariavel(usuarioId: string) {
  const rendaVariavel = await prisma.rendaVariavel.findUnique({
    where: { usuarioId },
  });

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
    investimentos: investimentos,
    outrosGanhos: [
      {
        descricao: rendaVariavel?.descricao,
        valor: rendaVariavel?.valor || 0
      }
    ]
  };
};
