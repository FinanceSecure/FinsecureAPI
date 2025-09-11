export class Usuario {
  constructor(
    public _id: string | null,
    public nome: string,
    public email: string,
    public senha: string,
    public criadoData?: Date,
    public atualizadoData?: Date,
  ) { }

  alterarSenha(novaSenha: string) {
    this.senha = novaSenha;
  }
}
