import { InvestmentCategory } from "@prisma/client";

export interface InvestmentStatementParamsDto {
  id: string;
}

export interface AddInvestmentRequestDto {
  investmentTypeId: string;
  investedAmount: number;
  purchaseDate: string;
  updatedAt?: string;
}

export interface RedeemInvestmentRequestDto {
  investedAmount: number;
}

export interface AddInvestmentTypeRequestDto {
  name: string;
  type: InvestmentCategory;
  benchmarkPercentage: number;
  hasIncomeTax: boolean;
}

export interface UpdateInvestmentTypeRequestDto {
  name?: string;
  type?: InvestmentCategory;
  benchmarkPercentage?: number;
  hasIncomeTax?: boolean;
}
