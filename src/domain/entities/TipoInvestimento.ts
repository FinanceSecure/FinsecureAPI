export class TipoInvestimento {
  constructor(
    public _id: string | null,
    public nome: string,
    public tipo: string,
    public valorPercentual: number,
  ) { }
}
