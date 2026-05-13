import { calculateInvestmentIncome } from "@domain/services/calcInvestimentoService";
import { ValidationError } from "../errors/ApplicationError.js";
import {
  IInvestmentRepository,
  InvestmentWithRelations,
} from "../ports/repositories";

const APPLICATION = "APPLICATION";
const REDEMPTION = "REDEMPTION";

function calculateLedgerBalance(investment: InvestmentWithRelations) {
  return (investment.applications ?? []).reduce((balance, application) => {
    const amount = Number(application.amount);
    if (application.type === APPLICATION) return balance + amount;
    if (application.type === REDEMPTION) return balance - amount;
    return balance;
  }, 0);
}

export function createInvestmentUseCases(deps: {
  investmentRepository: IInvestmentRepository;
}) {
  const { investmentRepository } = deps;

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

      if (!investedAmount || investedAmount <= 0)
        throw new ValidationError("Valor invalido.");

      if (!purchaseDate)
        throw new ValidationError("Data de compra nao informada.");

      return investmentRepository.addInvestment(
        userId,
        investmentTypeId,
        investedAmount,
        purchaseDate
      );
    },

    async redeemInvestment(
      userId: string,
      id: string,
      amountToRedeem: number
    ) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");
      if (!id)
        throw new ValidationError("Tipo de investimento nao informado.");
      if (!amountToRedeem || amountToRedeem <= 0)
        throw new ValidationError("Valor de resgate invalido.");

      const allInvestments =
        await investmentRepository.findInvestmentsWithApplications(userId);

      let investments = allInvestments.filter(inv => inv.id === id);

      if (investments.length === 0) {
        investments = allInvestments.filter(inv => inv.investmentType.id === id);
      }

      investments.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      if (!investments.length)
        throw new ValidationError(
          "Nenhum investimento encontrado para este tipo."
        );

      let totalAvailable = 0;

      const mapped = investments.map((investment) => {
        const balance = calculateLedgerBalance(investment);
        totalAvailable += balance;

        return {
          investment,
          balance,
        };
      }).filter(item => item.balance > 0);

      if (Number(totalAvailable.toFixed(2)) < amountToRedeem) {
        throw new ValidationError("Valor de resgate maior que o disponivel");
      }

      let remaining = amountToRedeem;
      const details = [];

      for (const item of mapped) {
        if (remaining <= 0) break;

        const { investment, balance } = item;

        if (balance <= remaining) {
          await investmentRepository.createRedemptionApplication(
            investment.id,
            userId,
            balance
          );

          remaining -= balance;

          details.push({
            investmentId: investment.id,
            redeemed: balance,
            type: "full",
          });
        } else {
          await investmentRepository.createRedemptionApplication(
            investment.id,
            userId,
            remaining
          );

          details.push({
            investmentId: investment.id,
            redeemed: remaining,
            type: "partial",
          });

          remaining = 0;
        }
      }

      return {
        message: "Resgate realizado com sucesso",
        requested: Number(amountToRedeem.toFixed(2)),
        totalRedeemed: amountToRedeem,
        remainingBalance: Number((totalAvailable - amountToRedeem).toFixed(2)),
        details,
      };
    },

    async getInvestmentsByType(userId: string, investmentTypeId: string) {
      const all = await investmentRepository.findInvestmentsWithApplications(userId);
      const investments = all.filter(inv =>
        inv.investmentType.id === investmentTypeId || inv.id === investmentTypeId
      );

      if (!investments.length)
        throw new ValidationError("Nenhum investimento encontrado.");

      let totalInvested = 0;
      let totalGross = 0;
      let totalTax = 0;
      let totalNet = 0;
      let totalFinal = 0;

      const statement = investments.map((investment) => {
        const applications = investment.applications ?? [];
        const netInvestedAmount = calculateLedgerBalance(investment);

        const referenceDate =
          applications.length > 0
            ? new Date(
              Math.min(...applications.map((a) => new Date(a.date).getTime()))
            )
            : investment.createdAt;

        const income = calculateInvestmentIncome(
          netInvestedAmount,
          investment.investmentType.benchmarkPercentage,
          referenceDate,
          investment.investmentType.hasIncomeTax
        );

        const netAmount = netInvestedAmount + income.netIncome;

        totalInvested += netInvestedAmount;
        totalGross += income.grossIncome;
        totalTax += income.taxAmount;
        totalNet += income.netIncome;
        totalFinal += netAmount;

        return {
          id: investment.id,
          purchaseDate: investment.createdAt,
          investedAmount: Number(netInvestedAmount.toFixed(2)),
          grossIncome: Number(income.grossIncome.toFixed(2)),
          tax: Number(income.taxAmount.toFixed(2)),
          netIncome: Number(income.netIncome.toFixed(2)),
          totalNetAmount: Number(netAmount.toFixed(2)),
        };
      });

      return {
        investmentTypeId,
        name: investments[0].investmentType.name,
        totalInvestedAmount: Number(totalInvested.toFixed(2)),
        totalGrossIncome: Number(totalGross.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        totalNetIncome: Number(totalNet.toFixed(2)),
        totalNetAmount: Number(totalFinal.toFixed(2)),
        latestApplications: statement,
      };
    },

    async getTotalInvested(userId: string) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");

      const investments =
        await investmentRepository.findInvestmentsWithApplications(userId);

      const total = investments.reduce((sum, inv) => {
        return sum + calculateLedgerBalance(inv);
      }, 0);

      return {
        totalInvested: Number(total.toFixed(2)),
      };
    },

    async getCompletedInvestments(userId: string) {
      if (!userId) throw new ValidationError("Usuario nao autenticado.");

      const investments =
        await investmentRepository.findInvestmentsWithApplications(userId);

      const detailedInvestments = investments.map(inv => ({
        ...inv,
        currentBalance: calculateLedgerBalance(inv)
      }));

      const totalInvestedAmount = detailedInvestments.reduce((sum, inv) => {
        return sum + inv.currentBalance;
      }, 0);

      return {
        totalInvestedAmount: Number(totalInvestedAmount.toFixed(2)),
        investments: detailedInvestments,
      };
    },
  };
}
