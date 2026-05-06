import { RendaFixa, RendaVariavel } from "@prisma/client";

export interface IReceitaRepository {
  listarRendaFixa(userId: string): Promise<RendaFixa[]>;
  obterRendaFixa(userId: string): Promise<RendaFixa | null>;
  criarRendaFixa(userId: string, valor: number): Promise<RendaFixa>;
  atualizarRendaFixa(userId: string, valor: number): Promise<RendaFixa>;
  removerRendaFixa(userId: string): Promise<RendaFixa>;
  listarRendaVariavel(userId: string): Promise<RendaVariavel[]>;
  obterRendaVariavelPorId(id: string): Promise<RendaVariavel | null>;
  criarRendaVariavel(data: {
    userId: string;
    descricao: string;
    valor: number;
  }): Promise<RendaVariavel>;
  atualizarRendaVariavel(data: {
    id: string;
    descricao?: string;
    valor?: number;
  }): Promise<RendaVariavel>;
  removerRendaVariavel(id: string): Promise<RendaVariavel>;
  obterTotalReceitasPorUsuario(userId: string): Promise<number>;
}
