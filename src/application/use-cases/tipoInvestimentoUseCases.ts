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
      if (!valorPercentual)
        throw new ValidationError("Valor percentual nao informado");

      return tipoInvestimentoRepository.criar({
        nome,
        tipo,
        valorPercentual,
        impostoRenda,
      });
    },

    async visualizarTipoInvestimento(id: string, valor = 1000) {
      if (!id) throw new ValidationError("ID nao informado");

      const investimento =
        await tipoInvestimentoRepository.encontrarPorId(id);

      if (!investimento) return null;

      const taxa = investimento.valorPercentual;
      const rendimentoDiario = valor * taxa;
      const rendimentoMensal = rendimentoDiario * 30;
      const rendimentoAnual = rendimentoDiario * 365;

      return {
        ...investimento,
        simulacao: {
          valorInicial: valor,
          rendimentoDiario,
          rendimentoMensal,
          rendimentoAnual,
        },
      };
    },
  };
}
