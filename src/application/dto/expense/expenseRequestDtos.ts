export interface AddExpenseRequestDto {
  amount: number;
  category: string;
  description: string;
  dueDate: string;
  scheduledAt?: string;
}

export interface ExpenseParamsDto {
  id: string;
}
