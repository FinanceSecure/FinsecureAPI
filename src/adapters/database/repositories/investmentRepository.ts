import prisma from "../db.js";
import {
  InvestmentApplicationType,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { IInvestmentRepository } from "@/application/ports/repositories";

interface Investment {
  userId: string;
  investmentTypeId: string;
  updatedAt?: Date | null;
}

interface InvestmentApplication {
  id: string;
  investmentId: string;
  type: InvestmentApplicationType;
  amount: number;
  date: Date;
}

interface InvestmentWithApplication {
  investment: Investment;
  application: InvestmentApplication;
}

export const InvestmentRepository: IInvestmentRepository = {
  async findTypeInvestment(
    investmentTypeId: string
  ) {
    return prisma.investmentType.findUnique({
      where: {
        id: investmentTypeId,
      },
    });
  },

  async findInvestment(
    userId: string,
    investmentTypeId: string
  ) {
    return prisma.investment.findFirst({
      where: {
        userId,
        investmentTypeId,
      },
    });
  },

  async createInvestmentApplication(
    investmentId: string,
    userId: string,
    investedAmount: number,
    purchaseDate: Date
  ) {
    const transaction =
      await prisma.transaction.create({
        data: {
          userId,
          amount: investedAmount,
          description: "Aplicação de investimento",
          type: TransactionType.INVESTMENT,
          category: TransactionCategory.INVESTMENT_APPLICATION,
          status: TransactionStatus.COMPLETED,
        },
      });

    return prisma.investmentApplication.create({
      data: {
        investmentId,
        type: InvestmentApplicationType.APPLICATION,
        amount: investedAmount,
        date: purchaseDate,
        transactionId: transaction.id,
      },
    });
  },

  async addInvestment(
    userId: string,
    investmentTypeId: string,
    investedAmount: number,
    purchaseDate: Date,
    updateDate?: Date
  ): Promise<InvestmentWithApplication> {

    const type = await this.findTypeInvestment(investmentTypeId);
    if (!type) {
      throw new Error("Tipo de investimento não encontrado");
    }

    let investment =
      await this.findInvestment(
        userId,
        investmentTypeId
      );

    if (!investment) {
      investment =
        await prisma.investment.create({
          data: {
            userId,
            investmentTypeId,
          },
        });
    }

    const application =
      await this.createInvestmentApplication(
        investment.id,
        userId,
        investedAmount,
        purchaseDate
      );

    return {
      investment,
      application,
    };
  },

  async findInvestmentsWithApplications(
    userId: string,
    investmentTypeId?: string
  ) {
    return prisma.investment.findMany({
      where: {
        userId,
        isRedeemed: false,
        ...(investmentTypeId && {
          investmentTypeId
        }),
      },

      include: { investmentType: true, applications: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async markInvestmentAsRedeemed(
    investmentId: string
  ) {
    return prisma.investment.update({
      where: { id: investmentId },
      data: { isRedeemed: true },
    });
  },

  async createRedemptionApplication(
    investmentId: string,
    userId: string,
    redeemedAmount: number
  ) {

    const transaction =
      await prisma.transaction.create({
        data: {
          userId,
          amount: redeemedAmount,
          description: "Resgate de investimento",
          type: TransactionType.INVESTMENT,
          category: TransactionCategory.INVESTMENT_REDEMPTION,
          status: TransactionStatus.COMPLETED,
        },
      });

    return prisma.investmentApplication.create({
      data: {
        investmentId,
        type: InvestmentApplicationType.REDEMPTION,
        amount: redeemedAmount,
        date: new Date(),
        transactionId: transaction.id,
      },
    });
  },

  async calculateTotalInvested(
    userId: string
  ) {

    const result =
      await prisma.investmentApplication.aggregate({
        where: {
          investment: {
            userId,
          },
        },
        _sum: {
          amount: true,
        },
      });

    return result._sum.amount || 0;
  },
};
