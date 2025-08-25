import prisma from "@/adapters/database/db";
import {
  IInvestimentoRepository,
  InvestimentoComAplicacao
} from "@/ports/repositories/IInvestimentoRepository";
import { AplicacaoInvestimento } from "@/domain/entities/AplicacaoInvestimento";
import { Investimento } from "@/domain/entities/Investimento";

export class InvestimentoRepository implements IInvestimentoRepository {
  async encontrarTipoInvestimento(tipoInvestimentoId: string): Promise<string | null> {
    const tipoEncontrado = await prisma.tipoInvestimento.findUnique({
      where: { id: tipoInvestimentoId }
    });

    return tipoEncontrado?.nome ?? null;
  }

  async encontrarInvestimento(usuarioId: string, tipoInvestimentoId: string): Promise<Investimento | null> {
    const inv = await prisma.investimento.findFirst({
      where: { usuarioId, tipoInvestimentoId }
    });
    if (!inv) return null;
    return new Investimento(
      inv.id,
      inv.usuarioId,
      inv.tipoInvestimentoId,
      inv.dataCompra,
      inv.dataAtualizacao ?? undefined,
      inv.resgatado,
      0
    )
  }

  async criarAplicacaoInvestimento(
    investimentoId: string,
    valorInvestido: number,
    dataCompra: Date
  ): Promise<AplicacaoInvestimento> {
    const app = await prisma.aplicacaoInvestimento.create({
      data: {
        investimentoId,
        tipo: "aplicacao",
        valor: valorInvestido,
        data: dataCompra
      }
    });

    return new AplicacaoInvestimento(
      app.id,
      app.investimentoId,
      app.tipo as "aplicacao" | "resgate",
      app.valor,
      app.data
    );
  }

  async adicionarInvestimento(
    usuarioId: string,
    tipoInvestimentoId: string,
    valorInvestido: number,
    dataCompra: Date,
    dataAtualizacao?: Date
  ): Promise<InvestimentoComAplicacao> {

    const tipo = await this.encontrarTipoInvestimento(tipoInvestimentoId);
    if (!tipo) throw new Error("Tipo de investimento não encontrado");

    let investimento = await this.encontrarInvestimento(usuarioId, tipoInvestimentoId);
    if (!investimento) {
      const inv = await prisma.investimento.create({
        data: { usuarioId, tipoInvestimentoId, dataCompra, dataAtualizacao: dataAtualizacao ?? dataCompra }
      });
      investimento = new Investimento(
        inv.id,
        inv.usuarioId,
        inv.tipoInvestimentoId,
        inv.dataCompra,
        inv.dataAtualizacao ?? undefined
      );
    }

    const aplicacao = await this.criarAplicacaoInvestimento(
      investimento.id!,
      valorInvestido,
      dataCompra
    );

    return { investimento, aplicacao };
  }

  async encontrarInvestimentosComAplicacoes(
    usuarioId: string,
    tipoInvestimentoId: string
  ): Promise<Investimento[]> {
    const invs = await prisma.investimento.findMany({
      where: {
        usuarioId,
        tipoInvestimentoId,
        resgatado: false
      },
      include: {
        tipoInvestimento: true,
        aplicacoes: true
      },
      orderBy: { dataCompra: "asc" }
    });

    return invs.map(inv => new Investimento(
      inv.id,
      inv.usuarioId,
      inv.tipoInvestimentoId,
      inv.dataCompra,
      inv.dataAtualizacao ?? undefined,
      inv.resgatado,
      0,
      inv.tipoInvestimento
    ));
  }

  async marcarInvestimentoComoResgatado(investimentoId: string): Promise<void> {
    await prisma.investimento.update({
      where: { id: investimentoId },
      data: { resgatado: true }
    });
  }

  async criarAplicacaoResgate(
    investimentoId: string,
    valorResgatado: number
  ): Promise<AplicacaoInvestimento> {
    const app = await prisma.aplicacaoInvestimento.create({
      data: {
        investimentoId,
        tipo: "resgate",
        valor: valorResgatado,
        data: new Date()
      }
    });

    return new AplicacaoInvestimento(
      app.id,
      app.investimentoId,
      "resgate",
      app.valor,
      app.data
    );
  }

  async atualizarSaldo(usuarioId: string, valorResgatado: number): Promise<void> {
    const saldo = await prisma.saldo.findUnique({ where: { usuarioId } });

    if (saldo) {
      await prisma.saldo.update({
        where: { usuarioId },
        data: {
          valor: {
            increment: valorResgatado
          }
        }
      });
    } else {
      await prisma.saldo.create({
        data: {
          usuarioId,
          valor: valorResgatado
        }
      });
    }
  }
}
