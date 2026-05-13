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

export interface InvestmentWithRelations {
  id: string;
  investmentTypeId: string;
  createdAt: Date;
  applications: InvestmentApplicationLedger[];
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
  markInvestmentAsRedeemed(
    investmentId: string
  ): Promise<any>;
  createRedemptionApplication(
    investmentId: string,
    userId: string,
    redeemedAmount: number
  ): Promise<any>;
  calculateTotalInvested(
    userId: string
  ): Promise<number>;
}
