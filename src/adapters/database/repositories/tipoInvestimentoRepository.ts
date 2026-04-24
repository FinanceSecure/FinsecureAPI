import prisma from "../db.js";
import { ITipoInvestimentoRepository } from "../../../application/ports/repositories/ITipoInvestimentoRepository.js";

export const tipoInvestimentoRepository: ITipoInvestimentoRepository = {
  criar(data) {
    return prisma.tipoInvestimento.create({ data });
  },

  encontrarPorId(id) {
    return prisma.tipoInvestimento.findFirst({
      where: { id },
    });
  },
};
