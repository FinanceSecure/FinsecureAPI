export class Saldo {
  constructor(
    public int: number | null,
    public usuarioId: number,
    public valor: number,
    public dataAtualizacao: Date,
  ) { }

  atualizarSaldo(novoValor: number) {
    this.valor = novoValor;
    this.dataAtualizacao = new Date();
  }
}
