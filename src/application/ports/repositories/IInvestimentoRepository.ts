export interface IInvestimentoRepository {
  encontrarTipoInvestimento(tipoInvestimentoId: string): Promise<any | null>;
  encontrarInvestimento(
    userId: string,
    tipoInvestimentoId: string
  ): Promise<any | null>;
  criarAplicacaoInvestimento(
    investimentoId: string,
    valorInvestido: number,
    dataCompra: Date
  ): Promise<any>;
  adicionarInvestimento(
    userId: string,
    tipoInvestimentoId: string,
    valorInvestido: number,
    dataCompra: Date,
    dataAtualizacao?: Date
  ): Promise<any>;
  encontrarInvestimentosComAplicacoes(
    userId: string,
    tipoInvestimentoId?: string
  ): Promise<any[]>;
  marcarInvestimentoComoResgatado(investimentoId: string): Promise<any>;
  criarAplicacaoResgate(
    investimentoId: string,
    valorResgatado: number
  ): Promise<any>;
  atualizarSaldo(userId: string, valorResgatado: number): Promise<void>;
  calcularTotalInvestido(userId: string): Promise<number>;
}
