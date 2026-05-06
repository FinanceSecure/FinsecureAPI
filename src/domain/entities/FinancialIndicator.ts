export class FinancialIndicator {
  constructor(
    public id: string,
    public name: string,
    public percentageValue: number,
    public referenceDate: Date
  ) { }
}
