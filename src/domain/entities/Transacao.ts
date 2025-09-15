type StatusTransacao = "PENDENTE" | "EFETIVADA";
type TipoTransacao = "ENTRADA" | "SAIDA" | "INVESTIMENTO";

export class Transacao {
  constructor(
    public id: string | null,
    public usuarioId: string,
    public tipo: TipoTransacao,
    public valor: number,
    public status: StatusTransacao,
    public descricao?: string,
    public data?: Date
  ) {}

  isAtiva(): boolean {
    return this.status === "EFETIVADA";
  }

  validarValor(): boolean {
    if (this.tipo === "ENTRADA" && this.valor <= 0) return false;
    if (this.tipo === "SAIDA" && this.valor >= 0) return false;
    if (this.tipo === "INVESTIMENTO" && this.valor <= 0) return false;
    return true;
  }
}
