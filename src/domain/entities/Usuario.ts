export class Usuario {
  constructor(
    public id: string | null,
    public nome: string,
    public email: string,
    public senha: string,
    public criado?: Date,
    public atualizado?: Date,
  ) {
    if (!email.includes("@")) throw new Error("Email inválido.");
  }

  alterarSenha(novaSenha: string) {
    this.senha = novaSenha;
  }
}
