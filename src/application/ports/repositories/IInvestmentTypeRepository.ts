import {
  InvestmentCategory,
  InvestmentType,
} from "@prisma/client";

export interface IInvestmentTypeRepository {
  create(data: {
    name: string;
    type: InvestmentCategory;
    benchmarkPercentage: number;
    hasIncomeTax: boolean;
  }): Promise<InvestmentType>;
  findById(
    id: string
  ): Promise<InvestmentType | null>;
  findAll(): Promise<InvestmentType[]>;
  update(
    id: string,
    data: {
      name?: string;
      type?: InvestmentCategory;
      benchmarkPercentage?: number;
      hasIncomeTax?: boolean;
    }
  ): Promise<InvestmentType>;
}
