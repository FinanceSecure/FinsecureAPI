export class Investimentos {
  constructor(
    public id: string | null,
    public usuarioId: string,
    public tipoInvestimentoId: string,
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
