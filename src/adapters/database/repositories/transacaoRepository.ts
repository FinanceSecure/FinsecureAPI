import prisma from "../db.js";
import { ITransacaoRepository } from "@application/ports/repositories/ITransacaoRepository.js";

export const TransacaoRepository: ITransacaoRepository = {
  criar(data) {
    return prisma.transacao.create({ data });
  },

  encontrarPorIdEUsuario(id, userId) {
    return prisma.transacao.findFirst({
      where: { id, userId },
    });
  },

  atualizar(id, data) {
    return prisma.transacao.update({
      where: { id },
      data,
    });
  },

  remover(id) {
    return prisma.transacao.delete({ where: { id } });
  },

  listarPendentesAte(dataLimite) {
    return prisma.transacao.findMany({
      where: {
        status: "PENDENTE",
        data: { lte: dataLimite },
      },
    });
  },

  async atualizarStatus(id, status) {
    await prisma.transacao.update({
      where: { id },
      data: { status },
    });
  },

  async obterTotalEfetivadoPorUsuario(userId) {
    const totalTransacoes = await prisma.transacao.aggregate({
      _sum: { valor: true },
      where: { userId, status: "EFETIVADA" },
    });

    return totalTransacoes._sum.valor || 0;
  },
};
