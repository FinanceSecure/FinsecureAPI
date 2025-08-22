import prisma from "../../adapters/database/db";
import { calcularRendimento } from "../services/calcInvestimentoService";
import { calcularResgateParcial } from "../services/calcResgateParcialService";

export async function resgatarInvestimento(
  usuarioId: string,
  tipoInvestimentoId: string,
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

  if (!investimentos.length) throw new Error("Nenhum investimento encontrado.");

  let totalDisponivel = 0;
  const calculados = [];

  for (const investimento of investimentos) {
    const valorAplicado = investimento.aplicacoes
      .filter(a => a.tipo === "aplicacao")
      .reduce((soma, a) => soma + a.valor, 0);

    const rendimento = calcularRendimento(
      valorAplicado,
      investimento.tipoInvestimento.valorPercentual,
      investimento.dataCompra,
      investimento.tipoInvestimento.impostoRenda
    );

    const valorTotalLiquido = rendimento.valorTotalLiquido;

    totalDisponivel += valorTotalLiquido;

    calculados.push({
      investimento,
      valorAplicado,
      rendimento,
      valorTotalLiquido
    });
  }

  if (valorParaResgatar > totalDisponivel) {
    throw new Error("Valor solicitado excede o disponível.");
  }

  let restante = valorParaResgatar;
  const detalhesResgate = [];
  let totalResgatado = 0;

  for (const item of calculados) {
    if (restante <= 0) break;

    const {
      investimento,
      valorAplicado,
      valorTotalLiquido,
      rendimento
    } = item;

    const resgate = calcularResgateParcial(valorTotalLiquido, valorAplicado, restante);

    await prisma.investimento.update({
      where: { id: investimento.id },
      data: { resgatado: resgate.tipo === "total" }
    });

    restante -= resgate.valorResgatado;
    totalResgatado += resgate.valorResgatado;

    detalhesResgate.push({
      id: investimento.id,
      tipo: resgate.tipo,
      valorResgatado: Number(resgate.valorResgatado.toFixed(2)),
      rendimentoLiquido: Number((rendimento.rendimentoLiquido * resgate.percentual).toFixed(2)),
      imposto: Number((rendimento.imposto * resgate.percentual).toFixed(2))
    });
  }

  await prisma.saldo.upsert({
    where: { usuarioId },
    update: { valor: { increment: totalResgatado } },
    create: { usuarioId, valor: totalResgatado }
  });

  return {
    message: "Resgate efetuado com sucesso.",
    valorTotalResgatado: Number(totalResgatado.toFixed(2)),
    sobrouParaResgatar: Number(restante.toFixed(2)),
    detalhes: detalhesResgate
  };
}
