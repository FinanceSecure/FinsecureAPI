import { calculateInvestmentIncome } from "@domain/services/calcInvestimentoService";
import { ValidationError } from "../errors/ApplicationError.js";
import { IInvestmentRepository, } from "../ports/repositories";

export function createInvestmentUseCases(deps: {
  investmentRepository: IInvestmentRepository;
}) {
  const { investmentRepository } = deps;

  return {
    async addInvestment(
      userId: string,
      investmentTypeId: string,
      investedAmount: number,
      purchaseDate: Date,
      updatedAt?: Date
    ) {
      if (!userId)
        throw new ValidationError("Usuário não autenticado.");

      if (!investmentTypeId)
        throw new ValidationError("Tipo de investimento não informado.");

      if (!investedAmount || investedAmount <= 0)
        throw new ValidationError("Valor inválido.");

      if (!purchaseDate)
        throw new ValidationError("Data de compra não informada.");

      return investmentRepository.addInvestment(
        userId,
        investmentTypeId,
        investedAmount,
        purchaseDate,
        updatedAt
      );
    },

    async redeemInvestment(
      userId: string,
      investmentTypeId: string,
      amountToRedeem: number
    ) {
      const investments =
        await investmentRepository.findInvestmentsWithApplications(
          userId,
          investmentTypeId
        );

      if (!investments.length)
        throw new ValidationError("Nenhum investimento encontrado");

      let totalAvailableAmount = 0;

      const calculatedIncomes = [];

      for (const investment of investments) {
        const investedAmount =
          investment.applications
            ?.filter(
              (application: any) =>
                application.type === "APPLICATION"
            )
            .reduce(
              (acc: number, current: any) =>
                acc + current.amount,
              0
            ) ?? 0;

        const redeemedAmount =
          investment.applications
            ?.filter(
              (application: any) =>
                application.type === "REDEMPTION"
            )
            .reduce(
              (acc: number, current: any) =>
                acc + current.amount,
              0
            ) ?? 0;

        const netInvestedAmount = investedAmount - redeemedAmount;
        const income = calculateInvestmentIncome(
          investedAmount,
          investment.investmentType.benchmarkPercentage,
          investment.createdAt,
          investment.investmentType.hasTax
        );

        const totalNetAmount = netInvestedAmount + income.netIncome;
        totalAvailableAmount += totalNetAmount;

        calculatedIncomes.push({
          investment,
          ...income,
          netInvestedAmount,
          totalNetAmount,
        });
      }

      if (totalAvailableAmount < amountToRedeem)
        throw new ValidationError("Valor para resgatar superior ao disponível.");

      let remainingAmountToRedeem = amountToRedeem;
      let totalRedeemed = 0;

      const redemptionDetails = [];

      for (const incomeInfo of calculatedIncomes) {
        if (remainingAmountToRedeem <= 0) break;

        const {
          investment,
          netIncome,
          taxAmount,
          netInvestedAmount,
          totalNetAmount,
        } = incomeInfo;

        if (totalNetAmount <= remainingAmountToRedeem) {
          await investmentRepository.markInvestmentAsRedeemed(
            investment.id
          );

          await investmentRepository.createRedemptionApplication(
            investment.id,
            netInvestedAmount
          );

          remainingAmountToRedeem -= totalNetAmount;

          totalRedeemed += totalNetAmount;

          redemptionDetails.push({
            id: investment.id,
            type: "total",
            redeemedAmount: totalNetAmount,
            purchaseDate: investment.createdAt,
            netIncome,
            taxAmount,
          });
        } else {
          const percentage = remainingAmountToRedeem / totalNetAmount;

          const partialInvestedAmount = netInvestedAmount * percentage;

          await investmentRepository.createRedemptionApplication(
            investment.id,
            partialInvestedAmount
          );

          totalRedeemed += remainingAmountToRedeem;

          redemptionDetails.push({
            id: investment.id,
            type: "partial",
            redeemedAmount: remainingAmountToRedeem,
            purchaseDate: investment.createdAt,
            netIncome: netIncome * percentage,
            tax: taxAmount * percentage,
          });

          remainingAmountToRedeem = 0;
        }
      }

      return {
        message: "Resgate efetuado com sucesso!",
        totalRedeemed: Number(totalRedeemed.toFixed(2)),
        remainingAmountToRedeem: Number(remainingAmountToRedeem.toFixed(2)),
        details: redemptionDetails,
      };
    },

    async getInvestmentsByType(
      userId: string,
      investmentTypeId: string
    ) {
      const investments =
        await investmentRepository.findInvestmentsWithApplications(
          userId,
          investmentTypeId
        );

      if (!investments.length)
        throw new ValidationError("Nenhum investimento ativo deste tipo encontrado");

      let totalInvestedAmount = 0;
      let totalGrossIncome = 0;
      let totalTax = 0;
      let totalNetIncome = 0;
      let totalNetAmount = 0;

      const statement = investments.map(
        (investment: any) => {
          const investedAmount =
            investment.applications
              ?.filter(
                (application: any) =>
                  application.type ===
                  "APPLICATION"
              )
              .reduce(
                (
                  acc: number,
                  current: any
                ) => acc + current.amount,
                0
              ) ?? 0;

          const income =
            calculateInvestmentIncome(
              investedAmount,
              investment.investmentType.benchmarkPercentage,
              investment.createdAt,
              investment.investmentType.hasTax
            );

          const netAmount = investedAmount + income.netIncome;
          totalInvestedAmount += investedAmount;
          totalGrossIncome += income.grossIncome;
          totalTax += income.taxAmount;
          totalNetIncome += income.netIncome;
          totalNetAmount += netAmount;

          return {
            id: investment.id,
            purchaseDate: investment.createdAt,
            investedAmount: Number(investedAmount.toFixed(2)),
            grossIncome: Number(income.grossIncome.toFixed(2)),
            tax: Number(income.taxAmount.toFixed(2)),
            netIncome: Number(income.netIncome.toFixed(2)),
            totalNetAmount: Number(netAmount.toFixed(2)),
          };
        }
      );

      return {
        investmentTypeId,
        name:
          investments[0].investmentType.name,

        totalInvestedAmount: Number(
          totalInvestedAmount.toFixed(2)
        ),

        totalGrossIncome: Number(
          totalGrossIncome.toFixed(2)
        ),

        totalTax: Number(
          totalTax.toFixed(2)
        ),

        totalNetIncome: Number(
          totalNetIncome.toFixed(2)
        ),

        totalNetAmount: Number(
          totalNetAmount.toFixed(2)
        ),

        latestApplications: statement,
      };
    },

    async getTotalInvested(
      userId: string
    ) {
      if (!userId) throw new ValidationError("Usuário não autenticado.");

      const total =
        await investmentRepository.calculateTotalInvested(
          userId
        );

      return {
        totalInvested: Number(
          total.toFixed(2)
        ),
      };
    },

    async getCompletedInvestments(
      userId: string
    ) {
      if (!userId) throw new ValidationError("Usuário não autenticado.");

      const investments =
        await investmentRepository.findInvestmentsWithApplications(userId);

      const totalInvestedAmount =
        await investmentRepository.calculateTotalInvested(userId);

      return {
        totalInvestedAmount,
        investments,
      };
    },
  };
}
