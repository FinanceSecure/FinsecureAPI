export class Balance {
  constructor(
    public id: string | null,
    public userId: string,
    public value: number,
    public updateDate: Date
  ) { }

  updateBalance(newValue: number) {
    this.value = newValue;
    this.updateDate = new Date();
  }
}
