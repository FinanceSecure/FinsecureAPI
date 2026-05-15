export class VariableIncome {
  constructor(
    public id: string | null,
    public userId: string,
    public title: string,
    public description: string,
    public amount: number,
    public type: string,
    public category: string,
    public status: string,
    public date?: Date,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null
  ) { }

  isActive(): boolean {
    return this.status === "COMPLETED" && (this.deletedAt === null || this.deletedAt === undefined);
  }

  updateDescription(newDescription: string): void {
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  updateAmount(newAmount: number): void {
    this.amount = newAmount;
    this.updatedAt = new Date();
  }

  remove(): void {
    this.deletedAt = new Date();
  }

  isValid(): boolean {
    if (!this.userId || !this.title || this.amount <= 0) return false;
    return true;
  }
}
