import prisma from "../db.js";
import {
  InvestmentApplicationType,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { IInvestmentRepository } from "@/application/ports/repositories";

const notDeletedFilter = {
  OR: [
    { deletedAt: null },
    { deletedAt: { isSet: false } },
  ],
};

export const InvestmentRepository: IInvestmentRepository = {
  async findTypeInvestment(investmentTypeId: string) {
    return prisma.investmentType.findUnique({
      where: { id: investmentTypeId },
    });
  },

  async findInvestment(userId: string, investmentTypeId: string) {
    return prisma.investment.findFirst({
      where: {
        userId,
        investmentTypeId,
        ...notDeletedFilter,
      },
    });
  },

  async findActiveByUserId(userId: string) {
    const investments = await prisma.investment.findMany({
      where: {
        userId,
        isRedeemed: false,
        ...notDeletedFilter,
      },
      select: {
        id: true,
        applications: {
          where: notDeletedFilter,
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    return investments.map((investment) => {
      const investedAmount = investment.applications.reduce((total, entry) => {
        if (entry.type === InvestmentApplicationType.APPLICATION) {
          return total + entry.amount;
        }

        if (entry.type === InvestmentApplicationType.REDEMPTION) {
          return total - entry.amount;
        }

        return total;
      }, 0);

      return {
        id: investment.id,
        investedAmount,
      };
    });
  },

  async createInvestmentApplication(
    investmentId: string,
    userId: string,
    investedAmount: number,
    purchaseDate: Date
  ) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          title: "Aplicacao de investimento",
          userId,
          amount: investedAmount,
          date: purchaseDate,
          description: "Aplicacao de investimento",
          type: TransactionType.INVESTMENT,
          category: TransactionCategory.INVESTMENT_APPLICATION,
          status: TransactionStatus.COMPLETED,
        },
      });

      const application = await tx.investmentApplication.create({
        data: {
          investmentId,
          type: InvestmentApplicationType.APPLICATION,
          amount: investedAmount,
          date: purchaseDate,
          transactionId: transaction.id,
        },
      });

      await tx.investment.update({
        where: { id: investmentId },
        data: {
          totalApplied: { increment: investedAmount },
          currentBalance: { increment: investedAmount },
          isRedeemed: false,
        },
      });

      return application;
    });
  },

  async addInvestment(
    userId,
    investmentTypeId,
    investedAmount,
    purchaseDate
  ) {
    const type = await this.findTypeInvestment(investmentTypeId);
    if (!type) throw new Error("Tipo de investimento nao encontrado");

    let investment = await this.findInvestment(userId, investmentTypeId);

    if (!investment) {
      investment = await prisma.investment.create({
        data: {
          userId,
          investmentTypeId,
        },
      });
    }

    const application = await this.createInvestmentApplication(
      investment.id,
      userId,
      investedAmount,
      purchaseDate
    );

    const updatedInvestment = await prisma.investment.findUnique({
      where: { id: investment.id },
    });

    return {
      investment: updatedInvestment,
      application,
    };
  },

  async findInvestmentsWithApplications(userId, investmentTypeId) {
    return prisma.investment.findMany({
      where: {
        userId,
        ...notDeletedFilter,
        ...(investmentTypeId && { investmentTypeId }),
      },
      include: {
        investmentType: true,
        applications: {
          where: notDeletedFilter,
          orderBy: {
            date: "asc",
          },
        },
        yields: {
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async findInvestmentsPendingYield(userId?: string) {
    return prisma.investment.findMany({
      where: {
        ...(userId && { userId }),
        isRedeemed: false,
        ...notDeletedFilter,
      },
      include: {
        investmentType: true,
        applications: {
          where: notDeletedFilter,
          orderBy: {
            date: "asc",
          },
        },
        yields: {
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async markInvestmentAsRedeemed(investmentId: string) {
    return prisma.investment.update({
      where: { id: investmentId },
      data: {
        isRedeemed: true,
        currentBalance: 0,
      },
    });
  },

  async createRedemptionApplication(
    investmentId: string,
    userId: string,
    redeemedAmount: number,
    redeemedAt = new Date()
  ) {
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          title: "Resgate de investimento",
          userId,
          amount: redeemedAmount,
          description: "Resgate de investimento",
          date: redeemedAt,
          type: TransactionType.INVESTMENT,
          category: TransactionCategory.INVESTMENT_REDEMPTION,
          status: TransactionStatus.COMPLETED,
        },
      });

      const application = await tx.investmentApplication.create({
        data: {
          investmentId,
          type: InvestmentApplicationType.REDEMPTION,
          amount: redeemedAmount,
          date: redeemedAt,
          transactionId: transaction.id,
        },
      });

      const investment = await tx.investment.update({
        where: { id: investmentId },
        data: {
          totalRedeemed: { increment: redeemedAmount },
          currentBalance: { decrement: redeemedAmount },
        },
      });

      return {
        application,
        currentBalance: investment.currentBalance,
      };
    });

    if (result.currentBalance <= 0) {
      await this.markInvestmentAsRedeemed(investmentId);
    }

    return result.application;
  },

  async createYieldHistory(data) {
    const existingEntry = await prisma.investmentYieldHistory.findFirst({
      where: {
        investmentId: data.investmentId,
        date: data.date,
      },
    });

    if (existingEntry) return existingEntry;

    return prisma.investmentYieldHistory.create({
      data,
    });
  },

  async updateYieldSnapshot(
    investmentId: string,
    currentBalance: number,
    lastYieldAt: Date
  ) {
    return prisma.investment.update({
      where: { id: investmentId },
      data: {
        currentBalance,
        lastYieldAt,
      },
    });
  },

  async calculateTotalInvested(userId: string) {
    const investments = await prisma.investment.findMany({
      where: {
        userId,
        ...notDeletedFilter,
      },
      select: {
        currentBalance: true,
      },
    });

    return investments.reduce(
      (total, investment) => total + investment.currentBalance,
      0
    );
  },
};
