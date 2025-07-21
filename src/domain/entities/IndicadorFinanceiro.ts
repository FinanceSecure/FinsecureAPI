export class IndicadorFinanceiro {
  constructor(
    public id: number | null,
    public nome: string,
    public valorPercentual: number,
    public dataReferencia: Date
  ) { }
}
