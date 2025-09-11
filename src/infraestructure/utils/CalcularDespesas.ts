type Despesas = {
  valor: number;
};

export function calcularTotalDespesas(
  despesasEfetuadas: Despesas[]
): number {
  return despesasEfetuadas.reduce(
    (total, despesa) => total + despesa.valor, 0
  );
};
