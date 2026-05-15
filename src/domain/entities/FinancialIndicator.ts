export class FinancialIndicator {
  constructor(
    public id: string,
    public name: string,
    public benchmarkPercentage: number,
    public referenceDate: Date
  ) { }
}
