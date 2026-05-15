import {
  TransactionCategory,
  TransactionStatus,
  TransactionType
} from "@prisma/client";

export interface CreateTransactionRequestDto {
  title: string;
  description?: string;
  amount: number;
  date: string;
  type: TransactionType;
  category?: TransactionCategory;
  isRecurring?: boolean;
}

export interface UpdateTransactionRequestDto {
  title?: string;
  description?: string;
  amount?: number;
  date?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  isRecurring?: boolean;
}

export interface TransactionParamsDto {
  id: string;
}

export interface ValidatedTransactionDto {
  title: string;
  userId: string;
  description?: string;
  amount: number;
  date: Date;
  type: TransactionType;
  category?: TransactionCategory;
  status: TransactionStatus;
  isRecurring: boolean;
}
