import { TransactionCategory } from "@prisma/client";

export interface AddExpenseRequestDto {
  amount: number;
  category: TransactionCategory;
  description?: string;
  dueDate: Date | null;
  scheduledAt: Date | null;
}

export interface ExpenseParamsDto {
  id: string;
}
