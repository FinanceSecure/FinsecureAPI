import { IBalanceRepository } from "@application/ports/repositories";
import { Balance } from "@prisma/client";
import prisma from "../db.js";

export class BalanceRepository implements IBalanceRepository {
  async obterSaldoPorUsuario(userId: string): Promise<Balance | null> {
    return prisma.balance.findFirst({ where: { userId } });
  }

  async atualizarSaldo(saldoId: string, amount: number): Promise<Balance> {
    return prisma.balance.update({ where: { id: saldoId }, data: { amount } });
  }

  async criarSaldo(userId: string, amount: number): Promise<Balance> {
    return prisma.balance.create({ data: { userId, amount } });
  }

  async incrementarSaldo(userId: string, amount: number): Promise<void> {
    await prisma.balance.upsert({
      where: { userId },
      update: { amount: { increment: amount } },
      create: { userId, amount },
    });
  }
}
