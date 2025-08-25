import prisma from "@/adapters/database/db";
import { ISaldoRepository } from "@/ports/repositories/ISaldoRepository";
import { Saldo } from "@/domain/entities/Saldo";

export class SaldoRepository implements ISaldoRepository {
  private static fromPrisma(data: any): Saldo {
    return new Saldo(
      data.id,
      data.usuarioId,
      data.valor,
      data.data,
      data.atualizado
    )
  }

  async obterSaldoPorUsuario(usuarioId: string): Promise<Saldo | null> {
    const saldoUsuario = await prisma.saldo.findFirst({ where: { usuarioId } });
    return saldoUsuario
      ? SaldoRepository.fromPrisma(saldoUsuario)
      : null;
  }

  async atualizarSaldo(saldoId: string, valor: number): Promise<Saldo> {
    const saldoAtualizado = await prisma.saldo.update({
      where: { id: saldoId },
      data: { valor }
    });
    return SaldoRepository.fromPrisma(saldoAtualizado);
  }

  async criarSaldo(usuarioId: string, valor: number): Promise<Saldo> {
    const novoSaldo = await prisma.saldo.create({
      data: { usuarioId, valor }
    });
    return SaldoRepository.fromPrisma(novoSaldo);
  }
}
