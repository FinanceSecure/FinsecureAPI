export interface ResultadoResgate {
  tipo: "total" | "parcial";
  percentual: number;
  novoValorInvestido: number;
  valorResgatado: number;
}

export function calcularResgateParcial(
  valorTotalLiquido: number,
  valorInvestido: number,
  valorParaResgatar: number
): ResultadoResgate {
  if (valorParaResgatar >= valorTotalLiquido) {
    return {
      tipo: "total",
      percentual: 1,
      novoValorInvestido: 0,
      valorResgatado: valorTotalLiquido
    }
  }

  const percentual = valorParaResgatar / valorTotalLiquido;
  const novoValorInvestido = valorInvestido * (1 - percentual);

  return {
    tipo: "parcial",
    percentual,
    novoValorInvestido,
    valorResgatado: valorParaResgatar
  }
}
