export class Saldo {
  constructor(
    public int: number | null,
    public usuarioId: number,
    public valor: number,
    public data?: Date,
  ) { }

  atualizarSaldo(novoValor: number) {
    this.valor = novoValor;
    this.data = new Date();
  }
}
