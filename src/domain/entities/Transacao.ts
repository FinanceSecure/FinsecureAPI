type TipoTransacao = "entrada" | "saida" | "investimento";
type StatusTransacao = "pendente" | "efetivada";

export class Transacao {
  constructor(
    public id: number | null,
    public usuarioId: number,
    public tipo: TipoTransacao,
    public valor: number,
    public status: StatusTransacao,
    public descricao?: string,
    public data?: Date,
  ) { }

  isAtiva(): boolean {
    return this.status === "efetivada"
  }

  validarValor(): boolean {
    if (this.tipo === "entrada" && this.valor <= 0) return false;
    if (this.tipo === "saida" && this.valor >= 0) return false;
    if (this.tipo === "investimento" && this.valor <= 0) return false;
    return true;
  }
}
