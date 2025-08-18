import prisma from "../../db";

interface Investimento {
  usuarioId: string;
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

export const InvestimentoRepository = {
  async encontrarTipoInvestimento(tipoInvestimentoId: string) {
    return prisma.tipoInvestimento.findUnique({
      where: {
        id: tipoInvestimentoId
      }
    });
  },

  async encontrarInvestimento(usuarioId: string, tipoInvestimentoId: string) {
    return prisma.investimento.findFirst({
      where: {
        usuarioId,
        tipoInvestimentoId
      }
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
        data: dataCompra
      }
    });
  },

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
      investimento = await prisma.investimento.create({
        data: {
          usuarioId,
          tipoInvestimentoId,
          dataCompra,
          dataAtualizacao: dataAtualizacao ?? dataCompra
        }
      });
    }

    const aplicacao = await this.criarAplicacaoInvestimento(
      investimento.id,
      valorInvestido,
      dataCompra
    );

    return { investimento, aplicacao };
  },

  async encontrarInvestimentosComAplicacoes(usuarioId: string, tipoInvestimentoId: string) {
    return prisma.investimento.findMany({
      where: {
        usuarioId,
        tipoInvestimentoId,
        resgatado: false
      },
      include: {
        tipoInvestimento: true,
        aplicacoes: true
      },
      orderBy: {
        dataCompra: "asc"
      }
    });
  },

  async marcarInvestimentoComoResgatado(investimentoId: string) {
    return prisma.investimento.update({
      where: { id: investimentoId },
      data: { resgatado: true }
    });
  },

  async criarAplicacaoResgate(investimentoId: string, valorResgatado: number) {
    return prisma.aplicacaoInvestimento.create({
      data: {
        investimentoId,
        tipo: "resgate",
        valor: valorResgatado,
        data: new Date()
      }
    });
  },

  async atualizarSaldo(usuarioId: string, valorResgatado: number) {
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
        data: { usuarioId, valor: valorResgatado }
      });
    }
  }
};
