export interface IInvestimentoRepository {
  encontrarTipoInvestimento(tipoInvestimentoId: string): Promise<any | null>;
  encontrarInvestimento(
    usuarioId: string,
    tipoInvestimentoId: string
  ): Promise<any | null>;
  criarAplicacaoInvestimento(
    investimentoId: string,
    valorInvestido: number,
    dataCompra: Date
  ): Promise<any>;
  adicionarInvestimento(
    usuarioId: string,
    tipoInvestimentoId: string,
    valorInvestido: number,
    dataCompra: Date,
    dataAtualizacao?: Date
  ): Promise<any>;
  encontrarInvestimentosComAplicacoes(
    usuarioId: string,
    tipoInvestimentoId?: string
  ): Promise<any[]>;
  marcarInvestimentoComoResgatado(investimentoId: string): Promise<any>;
  criarAplicacaoResgate(
    investimentoId: string,
    valorResgatado: number
  ): Promise<any>;
  atualizarSaldo(usuarioId: string, valorResgatado: number): Promise<void>;
  calcularTotalInvestido(usuarioId: string): Promise<number>;
}
