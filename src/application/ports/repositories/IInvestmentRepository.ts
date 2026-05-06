export interface IInvestmentRepository {
  findTypeInvestment(typeInvestmentId: string): Promise<any | null>;
  findInvestment(
    userId: string,
    typeInvestmentId: string
  ): Promise<any | null>;
  createInvestmentApplication(
    investmentId: string,
    investedAmount: number,
    purchaseDate: Date
  ): Promise<any>;
  addInvestment(
    userId: string,
    typeInvestmentId: string,
    investedAmount: number,
    purchaseDate: Date,
    updateDate?: Date
  ): Promise<any>;
  findInvestmentsWithApplications(
    userId: string,
    typeInvestmentId?: string
  ): Promise<any[]>;
  markInvestmentAsRedeemed(investmentId: string): Promise<any>;
  createRedemptionApplication(
    investmentId: string,
    redeemedAmount: number
  ): Promise<any>;
  updateBalance(userId: string, redeemedAmount: number): Promise<void>;
  calculateTotalInvested(userId: string): Promise<number>;
}
