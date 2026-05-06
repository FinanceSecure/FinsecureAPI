import { TipoTransacao, Transacao } from "@prisma/client";

export interface ITransacaoRepository {
  criar(data: {
    userId: string;
    descricao: string;
    valor: number;
    data: Date;
    tipo: TipoTransacao;
    status: "EFETIVADA" | "PENDENTE";
  }): Promise<Transacao>;
  encontrarPorIdEUsuario(
    id: string,
    userId: string
  ): Promise<Transacao | null>;
  atualizar(
    id: string,
    data: {
      descricao: string;
      valor: number;
      data: Date;
      tipo: TipoTransacao;
    }
  ): Promise<Transacao>;
  remover(id: string): Promise<Transacao>;
  listarPendentesAte(dataLimite: Date): Promise<Transacao[]>;
  atualizarStatus(id: string, status: "EFETIVADA" | "PENDENTE"): Promise<void>;
  obterTotalEfetivadoPorUsuario(userId: string): Promise<number>;
}
