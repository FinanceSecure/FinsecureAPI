import prisma from "../db.js";
import { IInvestmentTypeRepository } from "@/application/ports/repositories/IInvestmentTypeRepository.js";

export const InvestmentTypeRepository: IInvestmentTypeRepository = {
  create(data) {
    return prisma.investmentType.create({ data });
  },

  findById(id) {
    return prisma.investmentType.findFirst({
      where: { id },
    });
  },

  findAll() {
    return prisma.investmentType.findMany({
      orderBy: { createdAt: "asc" },
    });
  },

  update(id: string, data) {
    return prisma.investmentType.update({
      where: { id },
      data,
    });
  },
};
