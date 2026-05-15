import {
  addBusinessDays,
  differenceInBusinessDays,
  startOfDay,
} from "date-fns";
import { InvestmentCalculatorService } from "@domain/services/investment-calculator";
import {
  IInvestmentRepository,
  InvestmentWithRelations,
} from "../ports/repositories";

const ANNUAL_CDI = Number(process.env.CDI_ANUAL || 14.4);

function getInvestmentStartedAt(investment: InvestmentWithRelations) {
  const firstApplication = investment.applications
    .filter((application) => application.type === "APPLICATION")
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

  return firstApplication?.date ?? investment.createdAt;
}

export class ApplyDailyYieldUseCase {
  constructor(
    private readonly investmentRepository: IInvestmentRepository
  ) {}

  async execute(userId?: string) {
    const investments =
      await this.investmentRepository.findInvestmentsPendingYield(userId);
    let processedInvestments = 0;
    let createdEntries = 0;

    for (const investment of investments) {
      if (investment.isRedeemed) continue;

      const principalBalance =
        InvestmentCalculatorService.calculatePrincipalBalance(
          investment.applications
        );
      let currentBalance = Math.max(
        investment.currentBalance,
        principalBalance,
        0
      );

      if (currentBalance <= 0) continue;

      const lastYieldDate = startOfDay(
        investment.lastYieldAt ?? getInvestmentStartedAt(investment)
      );
      const today = startOfDay(new Date());
      const pendingBusinessDays = differenceInBusinessDays(today, lastYieldDate);

      if (pendingBusinessDays <= 0) continue;

      let yieldDate = lastYieldDate;

      for (let day = 0; day < pendingBusinessDays; day += 1) {
        yieldDate = addBusinessDays(yieldDate, 1);

        const yieldResult = InvestmentCalculatorService.calculateDailyYield(
          currentBalance,
          ANNUAL_CDI,
          investment.investmentType.benchmarkPercentage
        );

        await this.investmentRepository.createYieldHistory({
          investmentId: investment.id,
          date: yieldDate,
          dailyRate: yieldResult.dailyRate,
          yieldAmount: yieldResult.yieldAmount,
          balanceBefore: currentBalance,
          balanceAfter: yieldResult.balanceAfter,
        });

        currentBalance = yieldResult.balanceAfter;
        createdEntries += 1;
      }

      await this.investmentRepository.updateYieldSnapshot(
        investment.id,
        currentBalance,
        yieldDate
      );

      processedInvestments += 1;
    }

    return {
      processedInvestments,
      createdEntries,
    };
  }
}
