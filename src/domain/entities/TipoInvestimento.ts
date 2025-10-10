export class TipoInvestimento {
  constructor(
    public id: string | null,
    public nome: string,
    public tipo: string,
    public valorPercentual: number
  ) { }
}
