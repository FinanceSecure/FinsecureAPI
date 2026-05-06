import { TransactionType, Transaction } from "@prisma/client";

export interface ITransactionRepository {
  create(data: {
    userId: string;
    description: string;
    amount: number;
    date: Date;
    type: TransactionType;
    status: "COMPLETED" | "PENDING";
  }): Promise<Transaction>;
  findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<Transaction | null>;
  update(
    id: string,
    data: {
      description: string;
      amount: number;
      date: Date;
      type: TransactionType;
    }
  ): Promise<Transaction>;
  remove(id: string): Promise<Transaction>;
  listPendingUntil(deadline: Date): Promise<Transaction[]>;
  updateStatus(id: string, status: "COMPLETED" | "PENDING"): Promise<void>;
  getTotalCompletedByUser(userId: string): Promise<number>;
}
