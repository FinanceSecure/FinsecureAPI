export class IndicadorFinanceiro {
  constructor(
    public id: string,
    public nome: string,
    public valorPercentual: number,
    public dataReferencia: Date
  ) {}
}
