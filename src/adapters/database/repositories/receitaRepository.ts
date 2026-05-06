import prisma from "../db.js";
import { IReceitaRepository } from "@application/ports/repositories/IReceitaRepository.js";

export const ReceitaRepository: IReceitaRepository = {
  listarRendaFixa(userId) {
    return prisma.rendaFixa.findMany({ where: { userId } });
  },

  obterRendaFixa(userId) {
    return prisma.rendaFixa.findUnique({ where: { userId } });
  },

  criarRendaFixa(userId, valor) {
    return prisma.rendaFixa.create({
      data: { userId, valor },
    });
  },

  atualizarRendaFixa(userId, valor) {
    return prisma.rendaFixa.update({
      where: { userId },
      data: { valor },
    });
  },

  removerRendaFixa(userId) {
    return prisma.rendaFixa.delete({ where: { userId } });
  },

  listarRendaVariavel(userId) {
    return prisma.rendaVariavel.findMany({ where: { userId } });
  },

  obterRendaVariavelPorId(id) {
    return prisma.rendaVariavel.findUnique({ where: { id } });
  },

  criarRendaVariavel(data) {
    return prisma.rendaVariavel.create({ data });
  },

  atualizarRendaVariavel(data) {
    return prisma.rendaVariavel.update({
      where: { id: data.id },
      data: {
        descricao: data.descricao,
        valor: data.valor,
      },
    });
  },

  removerRendaVariavel(id) {
    return prisma.rendaVariavel.delete({ where: { id } });
  },

  async obterTotalReceitasPorUsuario(userId) {
    const rendaFixa = await prisma.rendaFixa.findMany({
      where: { userId },
    });
    const rendaVariavel = await prisma.rendaVariavel.findMany({
      where: { userId },
    });

    const totalRendaFixa = rendaFixa.reduce(
      (total, renda) => total + renda.valor,
      0
    );
    const totalRendaVariavel = rendaVariavel.reduce(
      (total, renda) => total + renda.valor,
      0
    );

    return totalRendaFixa + totalRendaVariavel;
  },
};
