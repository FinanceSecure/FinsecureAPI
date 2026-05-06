export interface FixedIncomeRequestDto {
  valor: number;
}

export interface VariableIncomeRequestDto {
  descricao: string;
  valor: number;
}

export interface UpdateVariableIncomeRequestDto {
  id: string;
  descricao?: string;
  valor?: number;
}

export interface VariableIncomeParamsDto {
  id: string;
}
