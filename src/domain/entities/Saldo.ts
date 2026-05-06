export class Saldo {
  constructor(
    public id: string | null,
    public userId: string,
    public valor: number,
    public dataAtualizacao: Date
  ) { }

  atualizarSaldo(novoValor: number) {
    this.valor = novoValor;
    this.dataAtualizacao = new Date();
  }
}
