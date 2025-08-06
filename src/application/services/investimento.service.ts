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

export async function encontrarInvestimentoCompleto(
  investimentoId: number,
  usuarioId: number
) {
  const investimento = await prisma.investimento.findFirst({
    where: { id: investimentoId, usuarioId },
    include: {
      tipoInvestimento: true,
      aplicacoes: true
    }
  });

  if (!investimento) throw new Error("Investimento não encontrado.");

  const percentualCDI = investimento.tipoInvestimento.valorPercentual;
  const aplicaIR = investimento.tipoInvestimento.impostoRenda;

  const aplicacoes = investimento.aplicacoes.filter(a => a.tipo === "aplicacao");
  const resgates = investimento.aplicacoes
    .filter(a => a.tipo === "resgate")
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  let valorTotalInvestido = 0;
  let rendimentoBruto = 0;
  let impostoTotal = 0;
  let rendimentoLiquido = 0;
  let valorTotalLiquido = 0;

  const aplicacoesDetalhadas = [];

  for (const aplic of aplicacoes) {
    const rendimento = calcularRendimento(
      aplic.valor,
      percentualCDI,
      aplic.data,
      aplicaIR
    );

    aplicacoesDetalhadas.push({
      data: aplic.data,
      valor: aplic.valor,
      diasUteis: rendimento.diasUteis,
      rendimentoBruto: rendimento.rendimentoBruto,
      imposto: rendimento.imposto,
      rendimentoLiquido: rendimento.rendimentoLiquido,
      valorTotalLiquido: rendimento.valorTotalLiquido
    });

    valorTotalInvestido += aplic.valor;
    rendimentoBruto += rendimento.rendimentoBruto;
    impostoTotal += rendimento.imposto;
    rendimentoLiquido += rendimento.rendimentoLiquido;
    valorTotalLiquido += rendimento.valorTotalLiquido;
  }

  let resgatado = 0;
  for (const resgate of resgates) {
    resgatado += resgate.valor;
    valorTotalLiquido -= resgate.valor;
  }

  return {
    investimentoId: investimento.id,
    tipoInvestimentoId: investimento.tipoInvestimentoId,
    nome: investimento.tipoInvestimento.nome,
    valorTotalInvestido: Number(valorTotalInvestido.toFixed(2)),
    rendimentoBruto: Number(rendimentoBruto.toFixed(2)),
    imposto: Number(impostoTotal.toFixed(2)),
    rendimentoLiquido: Number(rendimentoLiquido.toFixed(2)),
    valorResgatado: Number(resgatado.toFixed(2)),
    valorTotalLiquido: Number(valorTotalLiquido.toFixed(2)),
    aplicacoes: aplicacoesDetalhadas
  };
}

export async function adicionarInvestimento(
  usuarioId: number,
  tipoInvestimentoId: number,
  valorInvestido: number,
  dataCompra: Date,
  dataAtualizacao?: Date
) {
  if (!usuarioId) throw new Error("Usuário não autenticado.");
  if (!tipoInvestimentoId) throw new Error("Tipo de investimento não informado.");
  if (!valorInvestido || valorInvestido <= 0) throw new Error("Valor inválido.");
  if (!dataCompra) throw new Error("Data de compra não infomrada.");

  const tipo = await prisma.tipoInvestimento.findUnique({
    where: { id: tipoInvestimentoId }
  });

  if (!tipo) throw new Error("Tipo de investimento não encontrado.");

  let investimento = await prisma.investimento.findFirst({
    where: { usuarioId, tipoInvestimentoId }
  });

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

  const aplicacao = await prisma.aplicacaoInvestimento.create({
    data: {
      investimentoId: investimento.id,
      tipo: "aplicacao",
      valor: valorInvestido,
      data: dataCompra
    }
  });

  return {
    investimento,
    aplicacao
  };
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

  if (!investimentos.length) throw new Error("Nenhum investimento encontrado com este tipo.")

  let totalLiquidoDisponivel = 0;
  const rendimentoCalculados = [];

  for (const inv of investimentos) {
    const valorInvestido = inv.aplicacoes
      ?.filter(a => a.tipo === "aplicacao")
      .reduce((acc, cur) => acc + cur.valor, 0) ?? 0;

    const valorResgatado = inv.aplicacoes
      ?.filter(a => a.tipo === "resgate")
      .reduce((acc, cur) => acc + cur.valor, 0) ?? 0;

    const valorLiquidoInvestido = valorInvestido - valorResgatado;
    const rend = calcularRendimento(
      valorInvestido,
      inv.tipoInvestimento.valorPercentual,
      inv.dataCompra,
      inv.tipoInvestimento.impostoRenda
    );

    const valorTotalLiquido = valorLiquidoInvestido + rend.rendimentoLiquido;
    totalLiquidoDisponivel += valorTotalLiquido;

    rendimentoCalculados.push({
      investimento: inv,
      ...rend,
      valorLiquidoInvestido,
      valorTotalLiquido
    });
  }

  if (totalLiquidoDisponivel < valorParaResgatar)
    throw new Error("Nao foi possivel realizar o resgate pelo valor inforamdo.")

  let restanteParaResgatar = valorParaResgatar;
  let totalResgatado = 0;
  const detalhesResgate = [];

  for (const rendInfo of rendimentoCalculados) {
    const {
      investimento,
      rendimentoLiquido,
      imposto,
      valorLiquidoInvestido,
      valorTotalLiquido
    } = rendInfo;

    if (restanteParaResgatar <= 0) break;

    if (valorTotalLiquido <= restanteParaResgatar) {
      await prisma.investimento.update({
        where: { id: investimento.id },
        data: { resgatado: true }
      });

      await prisma.aplicacaoInvestimento.create({
        data: {
          investimentoId: investimento.id,
          tipo: "resgate",
          valor: valorLiquidoInvestido,
          data: new Date()
        }
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
      const valorParcialInvestido = valorLiquidoInvestido * percentual;

      await prisma.aplicacaoInvestimento.create({
        data: {
          investimentoId: investimento.id,
          tipo: "resgate",
          valor: valorParcialInvestido,
          data: new Date()
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
      tipoInvestimento: true,
      aplicacoes: true
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
    const valorInvestido = inv.aplicacoes
      ?.filter(a => a.tipo === "aplicacao")
      .reduce((acc, cur) => acc + cur.valor, 0) ?? 0;

    const rendimento = calcularRendimento(
      valorInvestido,
      inv.tipoInvestimento.valorPercentual,
      inv.dataCompra,
      inv.tipoInvestimento.impostoRenda
    );

    const valorLiquido = valorInvestido + rendimento.rendimentoLiquido;

    valorTotalInvestido += valorInvestido;
    valorTotalRendimentoBruto += rendimento.rendimentoBruto;
    valorTotalImposto += rendimento.imposto;
    valorTotalRendimentoLiquido += rendimento.rendimentoLiquido;
    valorTotalLiquido += valorLiquido;

    return {
      id: inv.id,
      dataCompra: inv.dataCompra,
      valorInvestido: Number(valorInvestido.toFixed(2)),
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
