export type InvestmentApplicationLedgerType =
  | "APPLICATION"
  | "REDEMPTION"
  | "DIVIDEND"
  | "INTEREST";

export interface InvestmentApplicationLedger {
  id: string;
  type: InvestmentApplicationLedgerType;
  amount: number;
  date: Date;
}

export interface InvestmentYieldLedger {
  id: string;
  date: Date;
  dailyRate: number;
  yieldAmount: number;
  balanceBefore: number;
  balanceAfter: number;
}

export interface InvestmentWithRelations {
  id: string;
  investmentTypeId: string;
  totalApplied: number;
  totalRedeemed: number;
  currentBalance: number;
  lastYieldAt: Date | null;
  isRedeemed: boolean;
  createdAt: Date;
  applications: InvestmentApplicationLedger[];
  yields: InvestmentYieldLedger[];
  investmentType: {
    id: string;
    name: string;
    benchmarkPercentage: number;
    hasIncomeTax: boolean;
  };
}

export interface IInvestmentRepository {
  findTypeInvestment(investmentTypeId: string): Promise<any | null>;
  findInvestment(
    userId: string,
    investmentTypeId: string
  ): Promise<any | null>;
  createInvestmentApplication(
    investmentId: string,
    userId: string,
    investedAmount: number,
    purchaseDate: Date
  ): Promise<any>;
  addInvestment(
    userId: string,
    investmentTypeId: string,
    investedAmount: number,
    purchaseDate: Date
  ): Promise<any>;
  findInvestmentsWithApplications(
    userId: string,
    investmentTypeId?: string
  ): Promise<InvestmentWithRelations[]>;
  findInvestmentsPendingYield(
    userId?: string
  ): Promise<InvestmentWithRelations[]>;
  findActiveByUserId(
    userId: string
  ): Promise<{ id: string; investedAmount: number }[]>;
  markInvestmentAsRedeemed(
    investmentId: string
  ): Promise<any>;
  createRedemptionApplication(
    investmentId: string,
    userId: string,
    redeemedAmount: number,
    redeemedAt?: Date
  ): Promise<any>;
  createYieldHistory(data: {
    investmentId: string;
    date: Date;
    dailyRate: number;
    yieldAmount: number;
    balanceBefore: number;
    balanceAfter: number;
  }): Promise<any>;
  updateYieldSnapshot(
    investmentId: string,
    currentBalance: number,
    lastYieldAt: Date
  ): Promise<any>;
  calculateTotalInvested(
    userId: string
  ): Promise<number>;
}
