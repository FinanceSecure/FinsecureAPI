import prisma from "@/adapters/database/db";

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

export async function adicionarRendaFixa(data: {
  usuarioId: string;
  valor: number
}) {
  const novaRendaFixa = await prisma.rendaFixa.create({
    data: {
      usuarioId: data.usuarioId,
      valor: data.valor
    }
  });

  return novaRendaFixa;
}

export async function alterarRendaFixa(data: {
  usuarioId: string;
  valor: number
}) {
  const renda = await prisma.rendaFixa.findUnique({
    where: { usuarioId: data.usuarioId }
  });

  if (!renda) {
    throw new Error("Renda fixa não encontrada para o usuário.");
  }

  const rendaFixaAtualizada = await prisma.rendaFixa.update({
    where: { usuarioId: data.usuarioId },
    data: { valor: data.valor }
  });

  return rendaFixaAtualizada;
}

export async function removerRendaFixa(usuarioId: string) {
  const rendaFixaRemovida = await prisma.rendaFixa.delete({
    where: { usuarioId }
  });

  return rendaFixaRemovida;
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

export async function verificarRendaVariavel(usuarioId: string) {
  const rendaVariavel = await prisma.rendaVariavel.findMany({
    where: { usuarioId }
  })

  return { rendaVariavel };
}

export async function adicionarRendaVariavel(data: {
  usuarioId: string;
  descricao: string;
  valor: number
}) {
  const novaRendaVariavel = await prisma.rendaVariavel.create({
    data: {
      usuarioId: data.usuarioId,
      descricao: data.descricao,
      valor: data.valor
    }
  });

  return novaRendaVariavel;
}

export async function alterarRendaVariavel(data: {
  id: string;
  descricao?: string;
  valor?: number
}) {
  if (!data.id)
    throw new Error("ID não informado.")

  const existente = await prisma.rendaVariavel.findUnique({
    where: { id: data.id }
  });

  if (!existente)
    throw new Error("Investimento nao encontrado.");

  const rendaVariavelAtualizada = await prisma.rendaVariavel.update({
    where: { id: data.id },
    data: {
      descricao: data.descricao,
      valor: data.valor
    }
  });

  return rendaVariavelAtualizada;
}

export async function removerRendaVariavel(id: string) {
  const existente = await prisma.rendaVariavel.findUnique({
    where: { id }
  });
  if (!existente)
    throw new Error("Investimento não encontrado.")

  const rendaVariavelRemovida = await prisma.rendaVariavel.delete({
    where: { id }
  });

  return rendaVariavelRemovida;
}
