import {
  Transaction,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

export interface ITransactionRepository {
  create(data: {
    userId: string;
    description?: string;
    amount: number;
    date: Date;
    type: TransactionType;
    category: TransactionCategory;
    status: TransactionStatus;
  }): Promise<Transaction>;
  findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<Transaction | null>;
  update(
    id: string,
    data: {
      description?: string;
      amount?: number;
      date?: Date;
      type?: TransactionType;
      category?: TransactionCategory;
    }
  ): Promise<Transaction>;
  getTotalCompletedByUser(userId: string): Promise<number>;
  listPendingUntil(deadline: Date): Promise<Transaction[]>;
  remove(id: string): Promise<Transaction>;
  updateStatus(
    id: string,
    status: TransactionStatus
  ): Promise<void>;
}
