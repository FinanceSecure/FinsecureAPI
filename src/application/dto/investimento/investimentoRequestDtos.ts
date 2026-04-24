export interface InvestmentStatementParamsDto {
  id: string;
}

export interface AddInvestmentRequestDto {
  tipoInvestimentoId: string;
  valorInvestido: number;
  dataCompra: string;
  dataAtualizacao?: string;
}

export interface RedeemInvestmentRequestDto {
  valor: number;
}

export interface AddInvestmentTypeRequestDto {
  nome: string;
  tipo: string;
  valorPercentual: number;
  impostoRenda: boolean;
}
