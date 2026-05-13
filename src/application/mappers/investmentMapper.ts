import { AddInvestmentDto } from "../dto/investment";

export function mapAddInvestment(dto: any): AddInvestmentDto {
  return {
    investmentTypeId: dto.tipoInvestimentoId,
    investedAmount: dto.valorInvestido,
    purchaseDate: dto.dataCompra,
    updatedAt: dto.updatedAt,
  };
}
