
export class Investimentos {
  constructor(
    public id: number | null,
    public usuarioId: number,
    public tipoInvestimentoId: number,
    public valorInvestido: number,
    public dataCompra: Date,
    public dataAtualizacao: Date,
    public rendimentoAcumulado: number = 0
  ) { }

  atualizarRendimento(valor: number) {
    this.rendimentoAcumulado = valor;
    this.dataAtualizacao = new Date();
  }
}
