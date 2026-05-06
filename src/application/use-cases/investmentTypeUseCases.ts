import { ValidationError } from "../errors/ApplicationError.js";
import { IInvestmentTypeRepository } from "../ports/repositories/";

export function createInvestmentTypeUseCases(
  investmentTypeRepository: IInvestmentTypeRepository
) {
  return {
    async acrescentarTipoInvestimento(
      name: string,
      type: string,
      percentageValue: number,
      incomeTax: boolean
    ) {
      if (!name) throw new ValidationError("Nome nao informado");
      if (!type) throw new ValidationError("Tipo nao informado");
      if (!percentageValue)
        throw new ValidationError("Valor percentual nao informado");

      return investmentTypeRepository.create({
        name,
        type,
        percentageValue,
        incomeTax,
      });
    },

    async visualizarTipoInvestimento(id: string, amount = 1000) {
      if (!id) throw new ValidationError("ID nao informado");

      const investmentType =
        await investmentTypeRepository.findById(id);

      if (!investmentType) return null;

      const rate = investmentType.percentageValue;
      const dailyYield = amount * rate;
      const monthlyYield = dailyYield * 30;
      const annualYield = dailyYield * 365;

      return {
        ...investmentType,
        simulacao: {
          valorInicial: amount,
          rendimentoDiario: dailyYield,
          rendimentoMensal: monthlyYield,
          rendimentoAnual: annualYield,
        },
      };
    },
  };
}
