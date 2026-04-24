export interface ITipoInvestimentoRepository {
  criar(data: {
    nome: string;
    tipo: string;
    valorPercentual: number;
    impostoRenda: boolean;
  }): Promise<any>;
  encontrarPorId(id: string): Promise<any | null>;
}
