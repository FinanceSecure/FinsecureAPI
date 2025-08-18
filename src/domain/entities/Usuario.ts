export class Usuario {
  constructor(
    public id: string,
    public email: string,
    public senhaHash: string,
    public nome: string,
    public criadoData?: Date,
    public atualizadoData?: Date,
  ) { }

  alterarSenha(novoHash: string) {
    this.senhaHash = novoHash;
  }
}
