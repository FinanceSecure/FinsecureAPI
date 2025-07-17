export class Usuario {
  constructor(
    public id: number | null,
    public email: string,
    public senhaHash: string,
    public primeiroNome: string,
    public ultimoNome: string,
    public criadoData?: Date,
    public atualizadoData?: Date,
  ) { }

  alterarSenha(novoHash: string) {
    this.senhaHash = novoHash;
  }
}
