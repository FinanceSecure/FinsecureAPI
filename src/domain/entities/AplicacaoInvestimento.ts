export class AplicacaoInvestimento {
  constructor(
    public id: string,
    public investimentoId: string,
    public tipo: "aplicacao" | "resgate",
    public valor: number,
    public data: Date
  ) { }
}
