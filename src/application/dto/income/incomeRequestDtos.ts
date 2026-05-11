export interface FixedIncomeRequestDto {
  amount: number;
}

export interface VariableIncomeRequestDto {
  title: string;
  description: string;
  amount: number;
}

export interface UpdateVariableIncomeRequestDto {
  id: string;
  description?: string;
  amount?: number;
}

export interface VariableIncomeParamsDto {
  id: string;
}
