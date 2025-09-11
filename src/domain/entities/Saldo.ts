export class Saldo {
  constructor(
    public _id: string | null,
    public usuarioId: string,
    public valor: number,
    public dataAtualizacao: Date,
  ) { }

  atualizarSaldo(novoValor: number) {
    this.valor = novoValor;
    this.dataAtualizacao = new Date();
  }
}
