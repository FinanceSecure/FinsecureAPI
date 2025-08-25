import { Investimento } from "@/domain/entities/Investimento";
import { AplicacaoInvestimento } from "@/domain/entities/AplicacaoInvestimento";

export interface InvestimentoComAplicacao {
  investimento: Investimento,
  aplicacao: AplicacaoInvestimento
}

export interface IInvestimentoRepository {
  encontrarTipoInvestimento(tipoInvestimentoId: string): Promise<string | null>;
  encontrarInvestimento(
    usuarioId: string,
    tipoInvestimentoId: string
  ): Promise<Investimento | null>;
  criarAplicacaoInvestimento(
    investimentoId: string,
    valorInvestido: number,
    dataCompra: Date
  ): Promise<AplicacaoInvestimento>
  adicionarInvestimento(
    usuarioId: string,
    tipoInvestimentoId: string,
    valorInvestido: number,
    dataCompra: Date,
    dataAtualizacao?: Date
  ): Promise<InvestimentoComAplicacao>
  encontrarInvestimentosComAplicacoes(
    usuarioId: string,
    tipoInvestimentoId: string
  ): Promise<Investimento[]>;
  marcarInvestimentoComoResgatado(investimentoId: string): Promise<void>;
  criarAplicacaoResgate(
    investimentoId: string,
    valorResgatado: number
  ): Promise<AplicacaoInvestimento>;
  atualizarSaldo(
    usuarioId: string,
    valorResgatado: number
  ): Promise<void>;
}