import { RendaFixa, RendaVariavel } from "@prisma/client";

export interface IReceitaRepository {
  listarRendaFixa(usuarioId: string): Promise<RendaFixa[]>;
  obterRendaFixa(usuarioId: string): Promise<RendaFixa | null>;
  criarRendaFixa(usuarioId: string, valor: number): Promise<RendaFixa>;
  atualizarRendaFixa(usuarioId: string, valor: number): Promise<RendaFixa>;
  removerRendaFixa(usuarioId: string): Promise<RendaFixa>;
  listarRendaVariavel(usuarioId: string): Promise<RendaVariavel[]>;
  obterRendaVariavelPorId(id: string): Promise<RendaVariavel | null>;
  criarRendaVariavel(data: {
    usuarioId: string;
    descricao: string;
    valor: number;
  }): Promise<RendaVariavel>;
  atualizarRendaVariavel(data: {
    id: string;
    descricao?: string;
    valor?: number;
  }): Promise<RendaVariavel>;
  removerRendaVariavel(id: string): Promise<RendaVariavel>;
  obterTotalReceitasPorUsuario(usuarioId: string): Promise<number>;
}
