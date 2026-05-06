import prisma from "../db.js";
import { IInvestimentoRepository } from "@application/ports/repositories/IInvestimentoRepository.js";

interface Investimento {
  userId: string;
  tipoInvestimentoId: string;
  dataCompra: Date;
  dataAtualizacao?: Date | null;
}

interface AplicacaoInvestimento {
  id: string;
  investimentoId: string;
  tipo: string;
  valor: number;
  data: Date;
}

interface InvestimentoComAplicacao {
  investimento: Investimento;
  aplicacao: AplicacaoInvestimento;
}

export const InvestimentoRepository: IInvestimentoRepository = {
  async encontrarTipoInvestimento(tipoInvestimentoId: string) {
    return prisma.tipoInvestimento.findUnique({
      where: {
        id: tipoInvestimentoId,
      },
    });
  },

  async encontrarInvestimento(userId: string, tipoInvestimentoId: string) {
    return prisma.investimento.findFirst({
      where: {
        userId,
        tipoInvestimentoId,
      },
    });
  },

  async criarAplicacaoInvestimento(
    investimentoId: string,
    valorInvestido: number,
    dataCompra: Date
  ) {
    return prisma.aplicacaoInvestimento.create({
      data: {
        investimentoId,
        tipo: "aplicacao",
        valor: valorInvestido,
        data: dataCompra,
      },
    });
  },

  async adicionarInvestimento(
    userId: string,
    tipoInvestimentoId: string,
    valorInvestido: number,
    dataCompra: Date,
    dataAtualizacao?: Date
  ): Promise<InvestimentoComAplicacao> {
    const tipo = await this.encontrarTipoInvestimento(tipoInvestimentoId);
    if (!tipo) throw new Error("Tipo de investimento não encontrado");

    let investimento = await this.encontrarInvestimento(
      userId,
      tipoInvestimentoId
    );
    if (!investimento) {
      investimento = await prisma.investimento.create({
        data: {
          userId,
          tipoInvestimentoId,
          dataCompra,
          dataAtualizacao: dataAtualizacao ?? dataCompra,
        },
      });
    }

    const aplicacao = await this.criarAplicacaoInvestimento(
      investimento.id,
      valorInvestido,
      dataCompra
    );

    return { investimento, aplicacao };
  },

  async encontrarInvestimentosComAplicacoes(
    userId: string,
    tipoInvestimentoId?: string
  ) {
    return prisma.investimento.findMany({
      where: {
        userId,
        resgatado: false,
        ...(tipoInvestimentoId && { tipoInvestimentoId }),
      },
      include: {
        tipoInvestimento: true,
        aplicacoes: true,
      },
      orderBy: {
        dataCompra: "asc",
      },
    });
  },

  async marcarInvestimentoComoResgatado(investimentoId: string) {
    return prisma.investimento.update({
      where: { id: investimentoId },
      data: { resgatado: true },
    });
  },

  async criarAplicacaoResgate(investimentoId: string, valorResgatado: number) {
    return prisma.aplicacaoInvestimento.create({
      data: {
        investimentoId,
        tipo: "resgate",
        valor: valorResgatado,
        data: new Date(),
      },
    });
  },

  async atualizarSaldo(userId: string, valorResgatado: number) {
    const saldo = await prisma.saldo.findUnique({ where: { userId } });
    if (saldo) {
      await prisma.saldo.update({
        where: { userId },
        data: {
          valor: {
            increment: valorResgatado,
          },
        },
      });
    } else {
      await prisma.saldo.create({
        data: { userId, valor: valorResgatado },
      });
    }
  },

  async calcularTotalInvestido(userId: string) {
    const result = await prisma.aplicacaoInvestimento.aggregate({
      where: { investimento: { userId } },
      _sum: {
        valor: true
      }
    });
    return result._sum.valor || 0;
  }
};
