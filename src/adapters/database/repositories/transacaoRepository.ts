import prisma from "../db.js";
import { ITransacaoRepository } from "../../../application/ports/repositories/ITransacaoRepository.js";

export const transacaoRepository: ITransacaoRepository = {
  criar(data) {
    return prisma.transacao.create({ data });
  },

  encontrarPorIdEUsuario(id, usuarioId) {
    return prisma.transacao.findFirst({
      where: { id, usuarioId },
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

  async obterTotalEfetivadoPorUsuario(usuarioId) {
    const totalTransacoes = await prisma.transacao.aggregate({
      _sum: { valor: true },
      where: { usuarioId, status: "EFETIVADA" },
    });

    return totalTransacoes._sum.valor || 0;
  },
};
