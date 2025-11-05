import prisma from "@/adapters/database/db";
import { calcularValorTotalInvestido } from "@/infraestructure/utils/calcInvestimentos";

export async function verificarReceitas(usuarioId: string) {
  const rendaFixa = await prisma.rendaFixa.findMany({
    where: { usuarioId },
  });
  const rendaVariavel = await prisma.rendaVariavel.findMany({
    where: { usuarioId }
  });
  const totalRendaFixa = rendaFixa.reduce(
    (total, renda) => total + renda.valor, 0
  );
  const totalRendaVariavel = rendaVariavel.reduce(
    (total, renda) => total + renda.valor, 0
  );
  const totalReceitas = totalRendaFixa + totalRendaVariavel;

  return {
    rendaFixa: totalRendaFixa,
    rendaVariavel: totalRendaVariavel,
    totalReceitas: totalReceitas,
    detalhes: {
      rendaFixa,
      outros: rendaVariavel,
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

  return {
    descricao: rendaVariavel?.descricao,
    valor: rendaVariavel?.valor || 0
  };
};
