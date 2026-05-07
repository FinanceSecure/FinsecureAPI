import { TransactionType } from "@prisma/client";

export type TransactionRequestType = "ENTRADA" | "SAIDA" | TransactionType;

export interface CreateTransactionRequestDto {
  description: string;
  amount: number;
  date: string;
  type: TransactionRequestType;
}

export interface UpdateTransactionRequestDto {
  description: string;
  amount: number;
  date: string;
  type: TransactionRequestType;
}

export interface TransactionParamsDto {
  id: string;
}

export interface ValidatedTransactionDto {
  userId: string;
  description: string;
  amount: number;
  date: Date;
  type: TransactionType;
  status: "PENDING" | "COMPLETED";
}
