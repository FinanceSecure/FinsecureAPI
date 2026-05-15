import { ITransactionRepository } from "@/application/ports/repositories";

export class BalanceService {
  constructor(
    private transactionRepository: ITransactionRepository
  ) { }

  async calculateUserBalance(userId: string): Promise<number> {
    return this.transactionRepository.getTotalCompletedByUser(userId);
  }
}
