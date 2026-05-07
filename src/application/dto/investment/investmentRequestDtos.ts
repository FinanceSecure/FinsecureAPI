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
  type: string;
  percentageValue: number;
  hasIncomeTax: boolean;
}
