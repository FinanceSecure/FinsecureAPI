import prisma from "../../db";
import { calcularRendimento, Rendimento } from "../../domain/services/CalcularInvestimento";

export interface InvestimentoDetalhado {
  id: number;
  usuarioId: number;
  tipoInvestimentoId: number;
  valorInvestido: number;
  dataCompra: Date;
  diasUteis: number;
  rendimentoBruto: number;
  imposto: number;
  rendimentoLiquido: number;
  valorTotalLiquido: number;

  tipoInvesitmento: {
    id: number;
    nome: string;
    tipo: string;
    valorPercentual: number;
  };
}

export async function encontrarInvestimento(
  usuarioId: number,
  investimentoId: number
): Promise<InvestimentoDetalhado> {
  const inv = await prisma.investimento.findFirst({
    where: { id: investimentoId, usuarioId },
    include: { tipoInvestimento: true }
  });

  if (!inv)
    throw new Error("Investimento não encontrado!");

  const rend: Rendimento = calcularRendimento(
    inv.valorInvestido,
    inv.tipoInvestimento.valorPercentual,
    inv.dataCompra,
    inv.tipoInvestimento.impostoRenda
  );

  return {
    id: inv.id,
    usuarioId: inv.usuarioId,
    tipoInvestimentoId: inv.tipoInvestimentoId,
    valorInvestido: inv.valorInvestido,
    dataCompra: inv.dataCompra,
    ...rend,
    tipoInvesitmento: {
      id: inv.tipoInvestimento.id,
      nome: inv.tipoInvestimento.nome,
      tipo: inv.tipoInvestimento.tipo,
      valorPercentual: inv.tipoInvestimento.valorPercentual,
    }
  };
}

export async function listarInvestimentos(
  usuarioId: number
): Promise<InvestimentoDetalhado[]> {
  const invs = await prisma.investimento.findMany({
    where: { usuarioId },
    include: { tipoInvestimento: true }
  });
  return invs.map(inv => {
    const rend = calcularRendimento(
      inv.valorInvestido,
      inv.tipoInvestimento.valorPercentual,
      inv.dataCompra,
      inv.tipoInvestimento.impostoRenda
    );
    return {
      id: inv.id,
      usuarioId: inv.usuarioId,
      tipoInvestimentoId: inv.tipoInvestimentoId,
      valorInvestido: inv.valorInvestido,
      dataCompra: inv.dataCompra,
      ...rend,
      tipoInvesitmento: {
        id: inv.tipoInvestimento.id,
        nome: inv.tipoInvestimento.nome,
        tipo: inv.tipoInvestimento.tipo,
        valorPercentual: inv.tipoInvestimento.valorPercentual,
      }
    };
  });
}

export async function adicionarInvestimento(
  usuarioId: number,
  tipoInvestimentoId: number,
  valorInvestido: number,
  dataCompra: Date,
  dataAtualizacao?: Date
) {

  if (!usuarioId)
    throw new Error("Usuário não autenticado");

  if (!tipoInvestimentoId)
    throw new Error("Tipo de investimento não informado.");

  if (!valorInvestido || valorInvestido <= 0)
    throw new Error("Valor investido não informado.");

  if (!dataCompra)
    throw new Error("Data de compra não informada.");

  if (!dataAtualizacao || dataAtualizacao == null)
    dataAtualizacao = dataCompra;

  const tipo = await prisma.tipoInvestimento.findUnique({
    where: { id: tipoInvestimentoId }
  })

  if (!tipo)
    throw new Error("Tipo de investimento não encontrado.");

  const investimentoExistente = await prisma.investimento.findFirst({
    where: {
      usuarioId,
      tipoInvestimentoId
    }
  });

  if (investimentoExistente) {
    const investimentoAtualizado = await prisma.investimento.update({
      where: { id: investimentoExistente.id },
      data: {
        valorInvestido: investimentoExistente.valorInvestido + valorInvestido,
        dataAtualizacao: new Date()
      },
      include: {
        tipoInvestimento: true
      }
    });
    return investimentoAtualizado;
  } else {
    const investimento = await prisma.investimento.create({
      data: {
        usuarioId,
        tipoInvestimentoId,
        valorInvestido,
        dataCompra,
        dataAtualizacao
      },
      include: {
        tipoInvestimento: true
      }
    });

    return investimento;
  }
}

export async function resgatarInvestimento(
  usuarioId: number,
  tipoInvestimentoId: number,
  valorParaResgatar: number
) {
  const investimentos = await prisma.investimento.findMany({
    where: {
      usuarioId,
      tipoInvestimentoId,
      resgatado: false,
    },
    include: {
      tipoInvestimento: true,
    },
    orderBy: {
      dataCompra: "asc",
    }
  });

  if (!investimentos.length)
    throw new Error("Nenhum investimento encontrado para este tipo!");

  let totalLiquidoDisponivel = 0;
  const rendimentoCalculados = [];

  for (const inv of investimentos) {
    const rend = calcularRendimento(
      inv.valorInvestido,
      inv.tipoInvestimento.valorPercentual,
      inv.dataCompra,
      inv.tipoInvestimento.impostoRenda
    );

    const valorTotalLiquido = inv.valorInvestido + rend.rendimentoLiquido;

    totalLiquidoDisponivel += valorTotalLiquido;

    rendimentoCalculados.push({
      investimento: inv,
      ...rend,
      valorTotalLiquido
    });
  }

  if (totalLiquidoDisponivel < valorParaResgatar) {
    throw new Error("Não foi possível realizar o resgate com o valor solicitado.");
  }

  let restanteParaResgatar = valorParaResgatar;
  let totalResgatado = 0;
  const detalhesResgate = [];

  for (const rendInfo of rendimentoCalculados) {
    const { investimento, rendimentoLiquido, imposto, valorTotalLiquido } = rendInfo;

    if (restanteParaResgatar <= 0) break;

    if (valorTotalLiquido <= restanteParaResgatar) {
      await prisma.investimento.update({
        where: { id: investimento.id },
        data: { resgatado: true }
      });

      restanteParaResgatar -= valorTotalLiquido;
      totalResgatado += valorTotalLiquido;

      detalhesResgate.push({
        id: investimento.id,
        tipo: "total",
        valorResgatado: valorTotalLiquido,
        dataCompra: investimento.dataCompra,
        rendimentoLiquido,
        imposto
      });
    } else {
      const percentual = restanteParaResgatar / valorTotalLiquido;
      const novoValorInvestido = investimento.valorInvestido * (1 - percentual);

      await prisma.investimento.update({
        where: { id: investimento.id },
        data: {
          valorInvestido: novoValorInvestido
        }
      });

      totalResgatado += restanteParaResgatar;

      detalhesResgate.push({
        id: investimento.id,
        tipo: "parcial",
        valorResgatado: restanteParaResgatar,
        dataCompra: investimento.dataCompra,
        rendimentoLiquido: rendimentoLiquido * percentual,
        imposto: imposto * percentual
      });

      restanteParaResgatar = 0;
    }
  }

  const saldo = await prisma.saldo.findUnique({ where: { usuarioId } });

  if (saldo) {
    await prisma.saldo.update({
      where: { usuarioId },
      data: { valor: { increment: totalResgatado } }
    });
  } else {
    await prisma.saldo.create({
      data: { usuarioId, valor: totalResgatado }
    });
  }

  return {
    message: "Resgate efetuado com sucesso!",
    valorTotalResgatado: Number(totalResgatado.toFixed(2)),
    sobrouParaResgatar: Number(restanteParaResgatar.toFixed(2)),
    detalhes: detalhesResgate
  };
}

export async function atualizarInvestimento(
  usuarioId: number,
  investimentoId: number
) {

}

export async function consultarInvestimentosTipo(
  usuarioId: number,
  tipoInvestimentoId: number
) {
  const investimentos = await prisma.investimento.findMany({
    where: {
      usuarioId,
      tipoInvestimentoId,
      resgatado: false
    },
    include: {
      tipoInvestimento: true
    },
    orderBy: {
      dataCompra: "asc"
    }
  });

  if (!investimentos.length)
    throw new Error("Nenhum investimento ativo deste tipo encontrado");

  let valorTotalInvestido = 0;
  let valorTotalRendimentoBruto = 0;
  let valorTotalImposto = 0;
  let valorTotalRendimentoLiquido = 0;
  let valorTotalLiquido = 0;

  const extrato = investimentos.map((inv) => {
    const rendimento = calcularRendimento(
      inv.valorInvestido,
      inv.tipoInvestimento.valorPercentual,
      inv.dataCompra,
      inv.tipoInvestimento.impostoRenda
    );

    const valorLiquido = inv.valorInvestido + rendimento.rendimentoLiquido;

    valorTotalInvestido += inv.valorInvestido;
    valorTotalRendimentoBruto += rendimento.rendimentoBruto;
    valorTotalImposto += rendimento.imposto;
    valorTotalRendimentoLiquido += rendimento.rendimentoLiquido;
    valorTotalLiquido += valorLiquido;

    return {
      id: inv.id,
      dataCompra: inv.dataCompra,
      valorInvestido: inv.valorInvestido,
      rendimentoBruto: Number(rendimento.rendimentoBruto.toFixed(2)),
      imposto: Number(rendimento.imposto.toFixed(2)),
      rendimentoLiquido: Number(rendimento.rendimentoLiquido.toFixed(2)),
      valorTotalLiquido: Number(valorLiquido.toFixed(2)),
    };
  });

  return {
    tipoInvestimentoId,
    nome: investimentos[0].tipoInvestimento.nome,
    valorTotalInvestido: Number(valorTotalInvestido.toFixed(2)),
    valorTotalRendimentoBruto: Number(valorTotalRendimentoBruto.toFixed(2)),
    valorTotalImposto: Number(valorTotalImposto.toFixed(2)),
    valorTotalRendimentoLiquido: Number(valorTotalRendimentoLiquido.toFixed(2)),
    valorTotalLiquido: Number(valorTotalLiquido.toFixed(2)),
    ultimasAplicacoes: extrato
  };
}
