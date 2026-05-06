import { Balance } from "@prisma/client";

export interface IBalanceRepository {
  getBalanceByUserId(userId: string): Promise<Balance | null>;
  updateBalance(balanceId: string, amount: number): Promise<Balance>;
  createBalance(userId: string, amount: number): Promise<Balance>;
  incrementBalance(userId: string, amount: number): Promise<void>;
}
