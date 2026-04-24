import { Despesas } from "@prisma/client";

export interface IDespesaRepository {
  listarPorUsuario(usuarioId: string): Promise<Despesas[]>;
  listarAgendadas(usuarioId: string): Promise<Despesas[]>;
  criar(data: {
    valor: number;
    dataVencimento: Date | null;
    categoria: string;
    descricao: string;
    dataAgendamento?: Date | null;
    usuarioId: string;
  }): Promise<Despesas>;
  obterTotalDespesasPorUsuario(usuarioId: string): Promise<number>;
}
