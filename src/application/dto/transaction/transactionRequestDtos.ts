import { TransactionType } from "@prisma/client";

export type TransactionRequestType = "ENTRADA" | "SAIDA" | TransactionType;

export interface CreateTransactionRequestDto {
  descricao: string;
  valor: number;
  data: string;
  tipo: TransactionRequestType;
}

export interface UpdateTransactionRequestDto {
  descricao: string;
  valor: number;
  data: string;
  tipo: TransactionRequestType;
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
