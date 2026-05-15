export class Investment {
  constructor(
    public id: string | null,
    public userId: string,
    public investmentTypeId: string,
    public investedValue: number,
    public buyDate: Date,
    public updateDate: Date,
    public accumulatedYield: number = 0
  ) { }

  updateYield(valor: number) {
    this.accumulatedYield = valor;
    this.updateDate = new Date();
  }
}
