import { InvestimentoRepository } from "@/adapters/database/repositories/investimentoRepository";
import { calcularRendimento } from "./calcInvestimentoService";

export async function adicionarInvestimento(
  usuarioId: string,
  tipoInvestimentoId: string,
  valorInvestido: number,
  dataCompra: Date,
  dataAtualizacao?: Date
) {
  if (!usuarioId) throw new Error("Usuário não autenticado.");
  if (!tipoInvestimentoId) throw new Error("Tipo de investimento não informado.");
  if (!valorInvestido || valorInvestido <= 0) throw new Error("Valor inválido.");
  if (!dataCompra) throw new Error("Data de compra não informada.");

  const { investimento, aplicacao } = await InvestimentoRepository.adicionarInvestimento(
    usuarioId,
    tipoInvestimentoId,
    valorInvestido,
    dataCompra,
    dataAtualizacao
  );

  return { investimento, aplicacao };
}

export async function resgatarInvestimento(
  usuarioId: string,
  tipoInvestimentoId: string,
  valorParaResgatar: number
) {
  const investimentos = await InvestimentoRepository.encontrarInvestimentosComAplicacoes(
    usuarioId,
    tipoInvestimentoId
  );
  if (!investimentos.length) throw new Error("Nenhum investimento encontrado");

  let totalLiquidoDisponivel = 0;
  const rendimentoCalculados = [];

  for (const inv of investimentos) {
    const valorInvestido = inv.aplicacoes?.filter(
      a => a.tipo === "aplicacao").reduce((acc, cur) => acc + cur.valor, 0) ?? 0;
    const valorResgatado = inv.aplicacoes?.filter(
      a => a.tipo === "resgate").reduce((acc, cur) => acc + cur.valor, 0) ?? 0;
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

  if (totalLiquidoDisponivel < valorParaResgatar) throw new Error("Valor para resgatar superior ao disponível.");

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
      await InvestimentoRepository.marcarInvestimentoComoResgatado(investimento.id);
      await InvestimentoRepository.criarAplicacaoResgate(
        investimento.id,
        valorLiquidoInvestido
      );

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

      await InvestimentoRepository.criarAplicacaoResgate(
        investimento.id,
        valorParcialInvestido
      );

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

  await InvestimentoRepository.atualizarSaldo(
    usuarioId,
    totalResgatado
  );

  return {
    message: "Resgate efetuado com sucesso!",
    valorTotalResgatado: Number(totalResgatado.toFixed(2)),
    sobrouParaResgatar: Number(restanteParaResgatar.toFixed(2)),
    detalhes: detalhesResgate
  };
}

export async function consultarInvestimentosPorTipo(
  usuarioId: string,
  tipoInvestimentoId: string
) {
  const investimentos = await InvestimentoRepository.encontrarInvestimentosComAplicacoes(
    usuarioId,
    tipoInvestimentoId
  );
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

export async function totalInvestido(usuarioId: string) {
  if (!usuarioId) throw new Error("Usuário não autenticado.");

  const total = await InvestimentoRepository.calcularTotalInvestido(usuarioId);
  return { totalInvestido: Number(total.toFixed(2)) };
}
