import { InvestmentCategory } from "@prisma/client";

export interface InvestmentStatementParamsDto {
  id: string;
}

export interface AddInvestmentDto {
  investmentTypeId: string;
  investedAmount: number;
  purchaseDate: string;
  updatedAt?: string;
}

export interface UpdateInvestmentDto {
  investmentTypeId?: string;
  investedAmount?: number;
}

export interface AddInvestmentRequestDto {
  investmentTypeId: string;
  investedAmount: number;
  purchaseDate: string;
  updatedAt?: string;
}

export interface RedeemInvestmentRequestDto {
  amount?: number;
  investedAmount?: number;
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
