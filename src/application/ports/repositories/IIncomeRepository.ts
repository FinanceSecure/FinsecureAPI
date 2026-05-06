import { FixedIncome, VariableIncome } from "@prisma/client";

export interface IIncomeRepository {
  listFixedIncome(userId: string): Promise<FixedIncome[]>;
  getFixedIncome(userId: string): Promise<FixedIncome | null>;
  createFixedIncome(userId: string, amount: number): Promise<FixedIncome>;
  updateFixedIncome(userId: string, amount: number): Promise<FixedIncome>;
  removeFixedIncome(userId: string): Promise<FixedIncome>;
  listVariableIncome(userId: string): Promise<VariableIncome[]>;
  getVariableIncomeById(id: string): Promise<VariableIncome | null>;
  createVariableIncome(data: {
    userId: string;
    description: string;
    amount: number;
  }): Promise<VariableIncome>;
  updateVariableIncome(data: {
    id: string;
    description?: string;
    amount?: number;
  }): Promise<VariableIncome>;
  removeVariableIncome(id: string): Promise<VariableIncome>;
  getTotalIncomeByUser(userId: string): Promise<number>;
}
