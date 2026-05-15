export interface InvestmentYieldHistory {
  id: string;
  investmentId: string;
  date: Date;
  dailyRate: number;
  yieldAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}
