export class Expense {
  constructor(
    public id: string | null,
    public userId: string,
    public amount: number,
    public category: string,
    public description: string,
    public dueDate: Date | null = null,
    public scheduledAt: Date | null | undefined = null,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null
  ) { }

  isPending(): boolean {
    return this.deletedAt === null || this.deletedAt === undefined;
  }

  isScheduled(): boolean {
    return this.scheduledAt !== null && this.scheduledAt !== undefined;
  }

  updateAmount(newAmount: number): void {
    this.amount = newAmount;
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.deletedAt = new Date();
  }
}
