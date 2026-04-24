import { ISaldoRepository } from "../../../application/ports/repositories/ISaldoRepository.js";
import { Saldo } from "@prisma/client";
import prisma from "../db.js";

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

  async incrementarSaldo(usuarioId: string, valor: number): Promise<void> {
    await prisma.saldo.upsert({
      where: { usuarioId },
      update: { valor: { increment: valor } },
      create: { usuarioId, valor },
    });
  }
}
