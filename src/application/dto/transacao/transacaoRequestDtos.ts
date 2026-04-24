import { TipoTransacao } from "@prisma/client";

export interface CreateTransactionRequestDto {
  descricao: string;
  valor: number;
  data: string;
  tipo: TipoTransacao;
}

export interface UpdateTransactionRequestDto {
  descricao: string;
  valor: number;
  data: string;
  tipo: TipoTransacao;
}

export interface TransactionParamsDto {
  id: string;
}

export interface ValidatedTransactionDto {
  usuarioId: string;
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoTransacao;
  status: "PENDENTE" | "EFETIVADA";
}
