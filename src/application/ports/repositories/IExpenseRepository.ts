import { Expense } from "@/domain/entities";

export interface IExpenseRepository {
  listByUserId(userId: string): Promise<Expense[]>;
  listScheduled(userId: string): Promise<Expense[]>;
  create(data: {
    amount: number;
    dueDate: Date | null;
    category: string;
    description: string;
    scheduledAt?: Date | null,
    userId: string;
  }): Promise<Expense>;
  getTotalByUserId(userId: string): Promise<number>;
}
