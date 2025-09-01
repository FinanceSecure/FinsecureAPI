import { Saldo } from "@prisma/client";

export interface ISaldoRepository {
  obterSaldoPorUsuario(usuarioId: string): Promise<Saldo | null>;
  atualizarSaldo(saldoId: string, valor: number): Promise<Saldo>;
  criarSaldo(usuarioId: string, valor: number): Promise<Saldo>;
}
