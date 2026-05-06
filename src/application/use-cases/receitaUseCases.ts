import { ValidationError } from "../errors/ApplicationError.js";
import { IReceitaRepository } from "../ports/repositories/IReceitaRepository.js";

export function criarReceitaUseCases(deps: {
  receitaRepository: IReceitaRepository;
  recalcularSaldo: (userId: string) => Promise<number>;
}) {
  const { receitaRepository, recalcularSaldo } = deps;

  return {
    async verificarReceitas(userId: string) {
      const rendaFixa =
        await receitaRepository.listarRendaFixa(userId);
      const rendaVariavel =
        await receitaRepository.listarRendaVariavel(userId);

      const totalRendaFixa = rendaFixa.reduce(
        (total, renda) => total + renda.valor,
        0
      );
      const totalRendaVariavel = rendaVariavel.reduce(
        (total, renda) => total + renda.valor,
        0
      );

      return {
        rendaFixa: totalRendaFixa,
        rendaVariavel: totalRendaVariavel,
        totalReceitas: totalRendaFixa + totalRendaVariavel,
        detalhes: { rendaFixa, outros: rendaVariavel },
      };
    },

    async verificarRendaFixa(userId: string) {
      const rendaFixa = await receitaRepository.obterRendaFixa(userId);
      return { rendaFixa };
    },

    async adicionarRendaFixa(data: { userId: string; valor: number }) {
      const novaRendaFixa = await receitaRepository.criarRendaFixa(
        data.userId,
        data.valor
      );
      await recalcularSaldo(data.userId);
      return novaRendaFixa;
    },

    async alterarRendaFixa(data: { userId: string; valor: number }) {
      const renda = await receitaRepository.obterRendaFixa(data.userId);

      if (!renda) {
        throw new ValidationError(
          "Renda fixa não encontrada para este usuário."
        );
      }

      const rendaFixaAtualizada =
        await receitaRepository.atualizarRendaFixa(
          data.userId,
          data.valor
        );

      await recalcularSaldo(data.userId);
      return rendaFixaAtualizada;
    },

    async removerRendaFixa(userId: string) {
      const rendaFixaRemovida =
        await receitaRepository.removerRendaFixa(userId);

      await recalcularSaldo(userId);
      return rendaFixaRemovida;
    },

    async verificarRendaVariavel(userId: string) {
      const rendaVariavel =
        await receitaRepository.listarRendaVariavel(userId);

      return { rendaVariavel };
    },

    async adicionarRendaVariavel(data: {
      userId: string;
      descricao: string;
      valor: number;
    }) {
      const novaRendaVariavel =
        await receitaRepository.criarRendaVariavel(data);

      await recalcularSaldo(data.userId);
      return novaRendaVariavel;
    },

    async alterarRendaVariavel(data: {
      id: string;
      descricao?: string;
      valor?: number;
    }) {
      if (!data.id) {
        throw new ValidationError("ID não informado.");
      }

      const existente =
        await receitaRepository.obterRendaVariavelPorId(data.id);

      if (!existente) {
        throw new ValidationError("Investimento não encontrado.");
      }

      const rendaVariavelAtualizada =
        await receitaRepository.atualizarRendaVariavel(data);

      await recalcularSaldo(existente.userId);
      return rendaVariavelAtualizada;
    },

    async removerRendaVariavel(id: string) {
      const existente =
        await receitaRepository.obterRendaVariavelPorId(id);

      if (!existente) {
        throw new ValidationError("Investimento não encontrado.");
      }

      const rendaVariavelRemovida =
        await receitaRepository.removerRendaVariavel(id);

      await recalcularSaldo(existente.userId);
      return rendaVariavelRemovida;
    },
  };
}
