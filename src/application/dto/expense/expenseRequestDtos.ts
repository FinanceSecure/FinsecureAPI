export interface AddExpenseRequestDto {
  valor: number;
  categoria: string;
  descricao: string;
  dataVencimento?: string | null;
  dataAgendamento?: string | null;
}

export interface ExpenseParamsDto {
  id: string;
}
