import prisma from "../db.js";
import { IInvestmentRepository } from "@/application/ports/repositories";

interface Investment {
  userId: string;
  typeInvestmentId: string;
  purchaseDate: Date;
  updatedAt?: Date | null;
}

interface InvestmentApplication {
  id: string;
  investmentId: string;
  type: string;
  amount: number;
  date: Date;
}

interface InvestmentWithApplication {
  investment: Investment;
  application: InvestmentApplication;
}

export const InvestmentRepository: IInvestmentRepository = {
  async findTypeInvestment(typeInvestmentId: string) {
    return prisma.investmentType.findUnique({
      where: {
        id: typeInvestmentId,
      },
    });
  },

  async findInvestment(userId: string, typeInvestmentId: string) {
    return prisma.investment.findFirst({
      where: {
        userId,
        investmentTypeId: typeInvestmentId,
      },
    });
  },

  async createInvestmentApplication(
    investmentId: string,
    investedAmount: number,
    purchaseDate: Date
  ) {
    return prisma.investmentApplication.create({
      data: {
        investmentId: investmentId,
        type: "aplicacao",
        amount: investedAmount,
        date: purchaseDate,
      },
    });
  },

  async addInvestment(
    userId: string,
    typeInvestmentId: string,
    investedAmount: number,
    purchaseDate: Date,
    updateDate?: Date
  ): Promise<InvestmentWithApplication> {
    const type = await this.findTypeInvestment(typeInvestmentId);
    if (!type) throw new Error("Tipo de investimento não encontrado");

    let investment = await this.findInvestment(
      userId,
      typeInvestmentId
    );
    if (!investment) {
      investment = await prisma.investment.create({
        data: {
          userId,
          investmentTypeId: typeInvestmentId,
          purchaseDate: purchaseDate,
          updatedAt: updateDate ?? purchaseDate,
        },
      });
    }

    const application = await this.createInvestmentApplication(
      investment.id,
      investedAmount,
      purchaseDate
    );

    return { investment, application };
  },

  async findInvestmentsWithApplications(
    userId: string,
    typeInvestmentId?: string
  ) {
    return prisma.investment.findMany({
      where: {
        userId,
        isRedeemed: false,
        ...(typeInvestmentId && { investmentTypeId: typeInvestmentId }),
      },
      include: {
        investmentType: true,
        applications: true,
      },
      orderBy: {
        purchaseDate: "asc",
      },
    });
  },

  async markInvestmentAsRedeemed(investmentId: string) {
    return prisma.investment.update({
      where: { id: investmentId },
      data: { isRedeemed: true },
    });
  },

  async createRedemptionApplication(investmentId: string, redeemedAmount: number) {
    return prisma.investmentApplication.create({
      data: {
        investmentId: investmentId,
        type: "resgate",
        amount: redeemedAmount,
        date: new Date(),
      },
    });
  },

  async updateBalance(userId: string, redeemedAmount: number) {
    const balance = await prisma.balance.findUnique({ where: { userId } });
    if (balance) {
      await prisma.balance.update({
        where: { userId },
        data: {
          amount: {
            increment: redeemedAmount,
          },
        },
      });
    } else {
      await prisma.balance.create({
        data: { userId, amount: redeemedAmount },
      });
    }
  },

  async calculateTotalInvested(userId: string) {
    const result = await prisma.investmentApplication.aggregate({
      where: { investment: { userId } },
      _sum: {
        amount: true
      }
    });
    return result._sum.amount || 0;
  }
};

