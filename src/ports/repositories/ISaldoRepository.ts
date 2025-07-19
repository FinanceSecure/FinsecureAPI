import { Saldo } from "@prisma/client";

export interface ISaldoRepository {
  obterSaldoPorUsuario(usuarioId: number): Promise<Saldo | null>;
  atualizarSaldo(saldoId: number, valor: number): Promise<Saldo>;
  criarSaldo(usuarioId: number, valor: number): Promise<Saldo>;
}
