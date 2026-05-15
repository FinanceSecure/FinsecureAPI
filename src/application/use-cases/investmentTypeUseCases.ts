import { InvestmentCategory } from "@prisma/client";
import { ValidationError } from "../errors/ApplicationError.js";
import { IInvestmentTypeRepository } from "../ports/repositories/";

export function createInvestmentTypeUseCases(
  investmentTypeRepository: IInvestmentTypeRepository
) {
  return {
    async acrescentarTipoInvestimento(
      name: string,
      type: InvestmentCategory,
      benchmarkPercentage: number,
      hasIncomeTax: boolean
    ) {
      if (!name)
        throw new ValidationError("Nome nao informado");

      if (!type)
        throw new ValidationError("Tipo nao informado");

      if (benchmarkPercentage === undefined || benchmarkPercentage === null)
        throw new ValidationError("Valor percentual nao informado");

      return investmentTypeRepository.create({
        name,
        type,
        benchmarkPercentage,
        hasIncomeTax,
      });
    },

    async visualizarTipoInvestimento(
      id: string,
      amount = 1000
    ) {
      if (!id)
        throw new ValidationError("ID nao informado");

      const investmentType =
        await investmentTypeRepository.findById(id);

      if (!investmentType)
        return null;

      // Taxa CDI diária aproximada (base 14.4% a.a)
      const CDI_DIARIO = 0.000459;
      const rateMultiplier = investmentType.benchmarkPercentage / 100;
      const dailyYield = amount * (CDI_DIARIO * rateMultiplier);
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

    async listarTiposInvestimento() {
      return investmentTypeRepository.findAll();
    },

    async atualizarTipoInvestimento(
      id: string,
      data: {
        name?: string;
        type?: InvestmentCategory;
        benchmarkPercentage?: number;
        hasIncomeTax?: boolean;
      }
    ) {
      if (!id)
        throw new ValidationError("ID nao informado");

      const investmentType =
        await investmentTypeRepository.findById(id);

      if (!investmentType)
        throw new ValidationError("Tipo de investimento nao encontrado");

      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined
        )
      );

      return investmentTypeRepository.update(
        id,
        cleanedData
      );
    },
  };
}
