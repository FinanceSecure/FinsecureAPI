type Aplicacao = {
  valor: number;
};

type Investimento = {
  aplicacoes: Aplicacao[];
};

export function calcularValorTotalInvestido(
  investimentosEfetuados: Investimento[]
): number {
  return investimentosEfetuados.reduce((total, invesimento) => {
    const totalAplicacoes = invesimento.aplicacoes.reduce(
      (soma, aplicacao) => soma + aplicacao.valor, 0);
    return total + totalAplicacoes
  }, 0);
}
