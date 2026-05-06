import prisma from "../db.js";
import { IBalanceRepository } from "@application/ports/repositories";
import { Balance } from "@prisma/client";

export class BalanceRepository implements IBalanceRepository {
  async getBalanceByUserId(userId: string): Promise<Balance | null> {
    return prisma.balance.findFirst({ where: { userId } });
  }

  async updateBalance(saldoId: string, amount: number): Promise<Balance> {
    return prisma.balance.update({ where: { id: saldoId }, data: { amount } });
  }

  async createBalance(userId: string, amount: number): Promise<Balance> {
    return prisma.balance.create({ data: { userId, amount } });
  }

  async incrementBalance(userId: string, amount: number): Promise<void> {
    await prisma.balance.upsert({
      where: { userId },
      update: { amount: { increment: amount } },
      create: { userId, amount },
    });
  }
}
