type StatusTransaction = "PENDENTE" | "EFETIVADA";
type TypeTransaction = "ENTRADA" | "SAIDA" | "INVESTIMENTO";

export class Transaction {
  constructor(
    public id: string | null,
    public userId: string,
    public tipo: TypeTransaction,
    public value: number,
    public status: StatusTransaction,
    public description?: string,
    public date?: Date
  ) { }

  isAtiva(): boolean {
    return this.status === "EFETIVADA";
  }

  validarValor(): boolean {
    if (this.tipo === "ENTRADA" && this.value <= 0) return false;
    if (this.tipo === "SAIDA" && this.value >= 0) return false;
    if (this.tipo === "INVESTIMENTO" && this.value <= 0) return false;
    return true;
  }
}
