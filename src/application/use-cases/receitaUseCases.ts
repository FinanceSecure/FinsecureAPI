import { ValidationError } from "../errors/ApplicationError.js";
import { IReceitaRepository } from "../ports/repositories/IReceitaRepository.js";

export function criarReceitaUseCases(deps: {
  receitaRepository: IReceitaRepository;
  recalcularSaldo: (usuarioId: string) => Promise<number>;
}) {
  const { receitaRepository, recalcularSaldo } = deps;

  return {
    async verificarReceitas(usuarioId: string) {
      const rendaFixa =
        await receitaRepository.listarRendaFixa(usuarioId);
      const rendaVariavel =
        await receitaRepository.listarRendaVariavel(usuarioId);

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

    async verificarRendaFixa(usuarioId: string) {
      const rendaFixa = await receitaRepository.obterRendaFixa(usuarioId);
      return { rendaFixa };
    },

    async adicionarRendaFixa(data: { usuarioId: string; valor: number }) {
      const novaRendaFixa = await receitaRepository.criarRendaFixa(
        data.usuarioId,
        data.valor
      );
      await recalcularSaldo(data.usuarioId);
      return novaRendaFixa;
    },

    async alterarRendaFixa(data: { usuarioId: string; valor: number }) {
      const renda = await receitaRepository.obterRendaFixa(data.usuarioId);

      if (!renda) {
        throw new ValidationError(
          "Renda fixa não encontrada para este usuário."
        );
      }

      const rendaFixaAtualizada =
        await receitaRepository.atualizarRendaFixa(
          data.usuarioId,
          data.valor
        );

      await recalcularSaldo(data.usuarioId);
      return rendaFixaAtualizada;
    },

    async removerRendaFixa(usuarioId: string) {
      const rendaFixaRemovida =
        await receitaRepository.removerRendaFixa(usuarioId);

      await recalcularSaldo(usuarioId);
      return rendaFixaRemovida;
    },

    async verificarRendaVariavel(usuarioId: string) {
      const rendaVariavel =
        await receitaRepository.listarRendaVariavel(usuarioId);

      return { rendaVariavel };
    },

    async adicionarRendaVariavel(data: {
      usuarioId: string;
      descricao: string;
      valor: number;
    }) {
      const novaRendaVariavel =
        await receitaRepository.criarRendaVariavel(data);

      await recalcularSaldo(data.usuarioId);
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

      await recalcularSaldo(existente.usuarioId);
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

      await recalcularSaldo(existente.usuarioId);
      return rendaVariavelRemovida;
    },
  };
}
