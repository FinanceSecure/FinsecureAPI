import { Saldo } from "@prisma/client";

export interface IBalanceRepository {
  obterSaldoPorUsuario(userId: string): Promise<Saldo | null>;
  atualizarSaldo(saldoId: string, valor: number): Promise<Saldo>;
  criarSaldo(userId: string, valor: number): Promise<Saldo>;
  incrementarSaldo(userId: string, valor: number): Promise<void>;
}
