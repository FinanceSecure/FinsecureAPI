import { differenceInBusinessDays } from "date-fns";
import { calculateDailyCDI } from "./cdiService";
import { getIncomeTaxRate } from "./incomeTaxService";

const ANNUAL_CDI = Number(process.env.CDI_ANUAL || 14.90);

export interface InvestmentIncome {
  businessDays: number;
  grossIncome: number;
  grossTotalAmount: number;
  taxAmount: number;
  netIncome: number;
  netTotalAmount: number;
}

export function calculateInvestmentIncome(
  investedAmount: number,
  cdiPercentage: number,
  purchaseDate: Date,
  hasIncomeTax: boolean
): InvestmentIncome {
  const today = new Date();
  const businessDays = differenceInBusinessDays(today, purchaseDate);
  const baseDailyCDI = calculateDailyCDI(ANNUAL_CDI);
  const dailyIncomeRate = baseDailyCDI * (cdiPercentage / 100);

  const grossIncome =
    investedAmount *
    Math.pow(
      1 + dailyIncomeRate,
      businessDays
    ) - investedAmount;

  let taxAmount = 0;
  if (hasIncomeTax) {
    const taxRate = getIncomeTaxRate(businessDays);
    taxAmount = grossIncome * taxRate;
  }

  const netIncome = grossIncome - taxAmount;

  return {
    businessDays,
    grossIncome: Number(grossIncome.toFixed(2)),
    grossTotalAmount: Number((investedAmount + grossIncome).toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    netIncome: Number(netIncome.toFixed(2)),
    netTotalAmount: Number((investedAmount + netIncome).toFixed(2)
    ),
  };
}
