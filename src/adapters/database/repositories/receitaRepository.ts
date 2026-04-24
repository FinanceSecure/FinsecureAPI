import prisma from "../db.js";
import { IReceitaRepository } from "../../../application/ports/repositories/IReceitaRepository.js";

export const receitaRepository: IReceitaRepository = {
  listarRendaFixa(usuarioId) {
    return prisma.rendaFixa.findMany({ where: { usuarioId } });
  },

  obterRendaFixa(usuarioId) {
    return prisma.rendaFixa.findUnique({ where: { usuarioId } });
  },

  criarRendaFixa(usuarioId, valor) {
    return prisma.rendaFixa.create({
      data: { usuarioId, valor },
    });
  },

  atualizarRendaFixa(usuarioId, valor) {
    return prisma.rendaFixa.update({
      where: { usuarioId },
      data: { valor },
    });
  },

  removerRendaFixa(usuarioId) {
    return prisma.rendaFixa.delete({ where: { usuarioId } });
  },

  listarRendaVariavel(usuarioId) {
    return prisma.rendaVariavel.findMany({ where: { usuarioId } });
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

  async obterTotalReceitasPorUsuario(usuarioId) {
    const rendaFixa = await prisma.rendaFixa.findMany({
      where: { usuarioId },
    });
    const rendaVariavel = await prisma.rendaVariavel.findMany({
      where: { usuarioId },
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
