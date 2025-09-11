export class IndicadorFinanceiro {
  constructor(
    public _id: string,
    public nome: string,
    public valorPercentual: number,
    public dataReferencia: Date
  ) { }
}
