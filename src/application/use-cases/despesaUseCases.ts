import { calcularTotalDespesas } from "../../shared/utils/calcDespesas.js";
import { IDespesaRepository } from "../ports/repositories/IDespesaRepository.js";

export function criarDespesaUseCases(deps: {
  despesaRepository: IDespesaRepository;
  recalcularSaldo: (usuarioId: string) => Promise<number>;
}) {
  const { despesaRepository, recalcularSaldo } = deps;

  return {
    listarDespesas(usuarioId: string) {
      return despesaRepository.listarPorUsuario(usuarioId);
    },

    async criarDespesa(despesaData: {
      valor: number;
      dataVencimento: Date | null;
      categoria: string;
      descricao: string;
      dataAgendamento?: Date | null;
      usuarioId: string;
    }) {
      const despesa = await despesaRepository.criar(despesaData);
      await recalcularSaldo(despesaData.usuarioId);
      return despesa;
    },

    listarDespesasAgendadas(usuarioId: string) {
      return despesaRepository.listarAgendadas(usuarioId);
    },

    async verificarTotalDespesas(usuarioId: string) {
      const despesas = await despesaRepository.listarPorUsuario(usuarioId);
      const totalDespesas = calcularTotalDespesas(despesas);

      return {
        totalDespesas,
        detalhes: { despesas },
      };
    },
  };
}
