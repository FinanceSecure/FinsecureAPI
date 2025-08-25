export class Saldo {
  constructor(
    public id: string | null,
    public usuarioId: string,
    public valor: number,
    public data: Date,
    public atualizado: Date | null,
  ) { }

  atualizarSaldo(novoValor: number) {
    this.valor = novoValor;
    this.atualizado = new Date();
  }
}
