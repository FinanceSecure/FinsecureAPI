import { differenceInBusinessDays } from "date-fns";
import { calculateDailyCDI } from "@/shared/utils/cdi";
import { getIncomeTaxRate } from "./incomeTaxService";

export type InvestmentLedgerEntryType =
  | "APPLICATION"
  | "REDEMPTION"
  | "DIVIDEND"
  | "INTEREST";

export interface InvestmentLedgerEntry {
  type: InvestmentLedgerEntryType;
  amount: number;
}

export interface InvestmentYieldEntry {
  yieldAmount: number;
}

export interface InvestmentPositionInput {
  applications: InvestmentLedgerEntry[];
  yields?: InvestmentYieldEntry[];
  currentBalance?: number | null;
  hasIncomeTax: boolean;
  startedAt: Date;
  referenceDate?: Date;
}

export class InvestmentCalculatorService {
  static calculateDailyRate(
    annualRate: number,
    benchmarkPercentage: number
  ) {
    return calculateDailyCDI(annualRate) * (benchmarkPercentage / 100);
  }

  static calculateDailyYield(
    balance: number,
    annualRate: number,
    benchmarkPercentage: number
  ) {
    const dailyRate = this.calculateDailyRate(
      annualRate,
      benchmarkPercentage
    );
    const yieldAmount = balance * dailyRate;

    return {
      dailyRate,
      yieldAmount,
      balanceAfter: balance + yieldAmount,
    };
  }

  static calculatePrincipalBalance(entries: InvestmentLedgerEntry[]) {
    return entries.reduce((balance, entry) => {
      const amount = Number(entry.amount);

      if (entry.type === "APPLICATION") return balance + amount;
      if (entry.type === "REDEMPTION") return balance - amount;

      return balance;
    }, 0);
  }

  static calculateAccumulatedYield(entries: InvestmentYieldEntry[] = []) {
    return entries.reduce(
      (total, entry) => total + Number(entry.yieldAmount),
      0
    );
  }

  static calculatePosition(input: InvestmentPositionInput) {
    const principalBalance = this.calculatePrincipalBalance(input.applications);
    const grossYield = this.calculateAccumulatedYield(input.yields);
    const grossBalance = Math.max(
      Number(input.currentBalance ?? 0),
      principalBalance + grossYield,
      0
    );
    const businessDays = Math.max(
      differenceInBusinessDays(
        input.referenceDate ?? new Date(),
        input.startedAt
      ),
      0
    );
    const incomeTax = input.hasIncomeTax
      ? Math.max(grossYield, 0) * getIncomeTaxRate(businessDays)
      : 0;
    const netYield = grossYield - incomeTax;
    const netBalance = grossBalance - incomeTax;

    return {
      principalBalance: this.roundMoney(principalBalance),
      grossYield: this.roundMoney(grossYield),
      incomeTax: this.roundMoney(incomeTax),
      netYield: this.roundMoney(netYield),
      grossBalance: this.roundMoney(grossBalance),
      netBalance: this.roundMoney(netBalance),
      businessDays,
    };
  }

  static roundMoney(value: number) {
    return Number(value.toFixed(2));
  }
}
