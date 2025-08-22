import prisma from "../db";
import { ISaldoRepository } from "../../../ports/repositories/ISaldoRepository";
import { Saldo } from "@prisma/client";

export class SaldoRepository implements ISaldoRepository {
  async obterSaldoPorUsuario(usuarioId: string): Promise<Saldo | null> {
    return prisma.saldo.findFirst({ where: { usuarioId } });
  }

  async atualizarSaldo(saldoId: string, valor: number): Promise<Saldo> {
    return prisma.saldo.update({ where: { id: saldoId }, data: { valor } });
  }

  async criarSaldo(usuarioId: string, valor: number): Promise<Saldo> {
    return prisma.saldo.create({ data: { usuarioId, valor } });
  }
}
