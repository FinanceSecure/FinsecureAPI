export interface IInvestmentTypeRepository {
  create(data: {
    name: string;
    type: string;
    percentageValue: number;
    incomeTax: boolean;
  }): Promise<any>;
  findById(id: string): Promise<any | null>;
}
