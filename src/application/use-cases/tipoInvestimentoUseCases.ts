import { ValidationError } from "../errors/ApplicationError.js";
import { ITipoInvestimentoRepository } from "../ports/repositories/ITipoInvestimentoRepository.js";

export function criarTipoInvestimentoUseCases(
  tipoInvestimentoRepository: ITipoInvestimentoRepository
) {
  return {
    async acrescentarTipoInvestimento(
      nome: string,
      tipo: string,
      valorPercentual: number,
      impostoRenda: boolean
    ) {
      if (!nome) throw new ValidationError("Nome nao informado");
      if (!tipo) throw new ValidationError("Tipo nao informado");
      if (!valorPercentual) {
        throw new ValidationError("Valor percentual nao informado");
      }

      return tipoInvestimentoRepository.criar({
        nome,
        tipo,
        valorPercentual,
        impostoRenda,
      });
    },

    visualizarTipoInvestimento(id: string) {
      return tipoInvestimentoRepository.encontrarPorId(id);
    },
  };
}
