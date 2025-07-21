export class TipoInvestimento {
  constructor(
    public id: number | null,
    public nome: string,
    public tipo: string,
    public valorPercentual: number,
  ) { }
}
