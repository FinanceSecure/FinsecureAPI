import prisma from "../../db";
import { ISaldoRepository } from "../../ports/repositories/ISaldoRepository";
import { Saldo } from "@prisma/client";

export class SaldoRepository implements ISaldoRepository {
  async obterSaldoPorUsuario(usuarioId: number): Promise<Saldo | null> {
    return prisma.saldo.findFirst({ where: { usuario_id: usuarioId } });
  }

  async atualizarSaldo(saldoId: number, valor: number): Promise<Saldo> {
    return prisma.saldo.update({ where: { id: saldoId }, data: { valor } });
  }

  async criarSaldo(usuarioId: number, valor: number): Promise<Saldo> {
    return prisma.saldo.create({ data: { usuario_id: usuarioId, valor } });
  }
}
