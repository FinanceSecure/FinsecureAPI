import { InvestmentCalculatorService } from "@domain/services/investment-calculator";
import { ApplyDailyYieldUseCase } from "./apply-daily-yieldUsecases";
import { ValidationError } from "../errors/index.js";
import {
  IInvestmentRepository,
  InvestmentWithRelations,
} from "../ports/repositories";

function normalizeMoney(value: number) {
  return InvestmentCalculatorService.roundMoney(value);
}

function getInvestmentStartedAt(investment: InvestmentWithRelations) {
  const firstApplication = investment.applications
    .filter((application) => application.type === "APPLICATION")
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

  return firstApplication?.date ?? investment.createdAt;
}

function getInvestmentAvailableBalance(investment: InvestmentWithRelations) {
  const startedAt = getInvestmentStartedAt(investment);
  const position = InvestmentCalculatorService.calculatePosition({
    applications: investment.applications,
    yields: investment.yields,
    currentBalance: investment.currentBalance,
    hasIncomeTax: investment.investmentType.hasIncomeTax,
    startedAt,
  });

  return position.grossBalance;
}

function toInvestmentPosition(investment: InvestmentWithRelations) {
  const startedAt = getInvestmentStartedAt(investment);
  const position = InvestmentCalculatorService.calculatePosition({
    applications: investment.applications,
    yields: investment.yields,
    currentBalance: investment.currentBalance,
    hasIncomeTax: investment.investmentType.hasIncomeTax,
    startedAt,
  });

  return {
    id: investment.id,
    investmentTypeId: investment.investmentTypeId,
    name: investment.investmentType.name,
    benchmarkPercentage: investment.investmentType.benchmarkPercentage,
    hasIncomeTax: investment.investmentType.hasIncomeTax,
    isRedeemed: investment.isRedeemed,
    createdAt: investment.createdAt,
    startedAt,
    purchaseDate: startedAt,
    lastYieldAt: investment.lastYieldAt,
    totals: {
      applied: normalizeMoney(
        investment.totalApplied ||
        investment.applications.reduce((acc, a) => acc + (a.amount > 0 ? a.amount : 0), 0)
      ),
      redeemed: normalizeMoney(
        investment.totalRedeemed ||
        investment.applications.reduce((acc, a) => acc + (a.amount < 0 ? Math.abs(a.amount) : 0), 0)
      ),
      principalBalance: position.principalBalance,
      grossYield: position.grossYield,
      incomeTax: position.incomeTax,
      netYield: position.netYield,
      grossBalance: position.grossBalance,
      netBalance: position.netBalance,
    },
    profitability: {
      businessDays: position.businessDays,
      yieldHistoryCount: investment.yields.length,
    },
    applications: investment.applications.map((application) => ({
      id: application.id,
      type: application.type,
      amount: normalizeMoney(application.amount),
      date: application.date,
    })),
    yields: investment.yields.map((yieldEntry) => ({
      id: yieldEntry.id,
      date: yieldEntry.date,
      dailyRate: yieldEntry.dailyRate,
      yieldAmount: normalizeMoney(yieldEntry.yieldAmount),
      balanceBefore: normalizeMoney(yieldEntry.balanceBefore),
      balanceAfter: normalizeMoney(yieldEntry.balanceAfter),
    })),
  };
}

function summarizePortfolio(investments: InvestmentWithRelations[]) {
  const positions = investments.map(toInvestmentPosition);

  const totals = positions.reduce(
    (summary, position) => ({
      applied: summary.applied + position.totals.applied,
      redeemed: summary.redeemed + position.totals.redeemed,
      principalBalance:
        summary.principalBalance + position.totals.principalBalance,
      grossYield: summary.grossYield + position.totals.grossYield,
      incomeTax: summary.incomeTax + position.totals.incomeTax,
      netYield: summary.netYield + position.totals.netYield,
      grossBalance: summary.grossBalance + position.totals.grossBalance,
      netBalance: summary.netBalance + position.totals.netBalance,
    }),
    {
      applied: 0,
      redeemed: 0,
      principalBalance: 0,
      grossYield: 0,
      incomeTax: 0,
      netYield: 0,
      grossBalance: 0,
      netBalance: 0,
    }
  );

  return {
    summary: {
      totalApplied: normalizeMoney(totals.applied),
      totalRedeemed: normalizeMoney(totals.redeemed),
      principalBalance: normalizeMoney(totals.principalBalance),
      grossYield: normalizeMoney(totals.grossYield),
      incomeTax: normalizeMoney(totals.incomeTax),
      netYield: normalizeMoney(totals.netYield),
      grossBalance: normalizeMoney(totals.grossBalance),
      netBalance: normalizeMoney(totals.netBalance),
      investmentCount: positions.length,
    },
    investments: positions,
  };
}

export function createInvestmentUseCases(deps: {
  investmentRepository: IInvestmentRepository;
}) {
  const { investmentRepository } = deps;
  const applyDailyYieldUseCase = new ApplyDailyYieldUseCase(investmentRepository);

  return {
    async addInvestment(
      userId: string,
      investmentTypeId: string,
      investedAmount: number,
      purchaseDate: Date
    ) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");
      if (!investmentTypeId)
        throw new ValidationError("Tipo de investimento nao informado.");
      if (!Number.isFinite(investedAmount) || investedAmount <= 0)
        throw new ValidationError("Valor invalido.");
      if (Number.isNaN(purchaseDate.getTime()))
        throw new ValidationError("Data de compra invalida.");

      const result = await investmentRepository.addInvestment(
        userId,
        investmentTypeId,
        normalizeMoney(investedAmount),
        purchaseDate
      );

      await applyDailyYieldUseCase.execute(userId);

      return {
        message: "Aplicacao registrada com sucesso.",
        investment: result.investment,
        application: result.application,
      };
    },

    async redeemInvestment(
      userId: string,
      id: string,
      amountToRedeem: number
    ) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");
      if (!id) throw new ValidationError("Investimento nao informado.");
      if (!Number.isFinite(amountToRedeem) || amountToRedeem <= 0)
        throw new ValidationError("Valor de resgate invalido.");

      const allInvestments =
        await investmentRepository.findInvestmentsWithApplications(userId);
      let investments = allInvestments.filter((investment) => investment.id === id);

      if (investments.length === 0) {
        investments = allInvestments.filter(
          (investment) => investment.investmentType.id === id
        );
      }

      investments = investments
        .filter((investment) => !investment.isRedeemed)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      if (!investments.length) {
        throw new ValidationError("Nenhum investimento encontrado.");
      }

      const availablePositions = investments
        .map((investment) => ({
          investment,
          balance: getInvestmentAvailableBalance(investment),
        }))
        .filter((position) => position.balance > 0);

      const totalAvailable = availablePositions.reduce(
        (total, position) => total + position.balance,
        0
      );

      if (normalizeMoney(totalAvailable) < normalizeMoney(amountToRedeem)) {
        throw new ValidationError("Valor de resgate maior que o disponivel.");
      }

      let remaining = normalizeMoney(amountToRedeem);
      const details = [];

      for (const position of availablePositions) {
        if (remaining <= 0) break;

        const redeemedAmount = normalizeMoney(
          Math.min(position.balance, remaining)
        );

        await investmentRepository.createRedemptionApplication(
          position.investment.id,
          userId,
          redeemedAmount
        );

        details.push({
          investmentId: position.investment.id,
          redeemedAmount,
          redemptionType:
            redeemedAmount >= normalizeMoney(position.balance)
              ? "FULL"
              : "PARTIAL",
        });

        remaining = normalizeMoney(remaining - redeemedAmount);
      }

      return {
        message: "Resgate realizado com sucesso.",
        requestedAmount: normalizeMoney(amountToRedeem),
        redeemedAmount: normalizeMoney(amountToRedeem - remaining),
        remainingBalance: normalizeMoney(totalAvailable - amountToRedeem),
        details,
      };
    },

    async getInvestmentsByType(userId: string, investmentTypeId: string) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");
      if (!investmentTypeId) {
        throw new ValidationError("Tipo de investimento nao informado.");
      }

      await applyDailyYieldUseCase.execute(userId);

      const investments =
        await investmentRepository.findInvestmentsWithApplications(
          userId,
          investmentTypeId
        );

      if (!investments.length) {
        throw new ValidationError("Nenhum investimento encontrado.");
      }

      return {
        investmentTypeId,
        name: investments[0].investmentType.name,
        ...summarizePortfolio(investments),
      };
    },

    async getTotalInvested(userId: string) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");

      await applyDailyYieldUseCase.execute(userId);

      const investments =
        await investmentRepository.findInvestmentsWithApplications(userId);
      const { summary } = summarizePortfolio(investments);

      return {
        totalInvested: summary.principalBalance,
        grossBalance: summary.grossBalance,
        netBalance: summary.netBalance,
      };
    },

    async getCompletedInvestments(userId: string) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");

      await applyDailyYieldUseCase.execute(userId);

      const investments =
        await investmentRepository.findInvestmentsWithApplications(userId);

      return summarizePortfolio(investments);
    },
  };
}
