export interface IInvestmentRepository {
  findTypeInvestment(
    investmentTypeId: string
  ): Promise<any | null>;
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
    purchaseDate: Date,
    updateDate?: Date
  ): Promise<any>;
  findInvestmentsWithApplications(
    userId: string,
    investmentTypeId?: string
  ): Promise<any[]>;
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
