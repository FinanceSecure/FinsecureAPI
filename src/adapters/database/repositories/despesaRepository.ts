import prisma from "../db.js";
import { IDespesaRepository } from "../../../application/ports/repositories/IDespesaRepository.js";

export const despesaRepository: IDespesaRepository = {
  listarPorUsuario(usuarioId) {
    return prisma.despesas.findMany({
      where: { usuarioId },
      orderBy: { dataVencimento: "desc" },
    });
  },

  listarAgendadas(usuarioId) {
    return prisma.despesas.findMany({
      where: {
        usuarioId,
        dataAgendamento: {
          gte: new Date(),
        },
      },
    });
  },

  criar(data) {
    return prisma.despesas.create({ data });
  },

  async obterTotalDespesasPorUsuario(usuarioId) {
    const despesas = await prisma.despesas.findMany({ where: { usuarioId } });
    return despesas.reduce((total, despesa) => total + despesa.valor, 0);
  },
};
