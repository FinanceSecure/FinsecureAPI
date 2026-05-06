import { calcularRendimento } from "../../domain/services/calcInvestimentoService.js";
import { ValidationError } from "../errors/ApplicationError.js";
import {
  IInvestmentRepository,
  IBalanceRepository,
} from "../ports/repositories/index.js";

export function createInvestmentUseCases(deps: {
  investmentRepository: IInvestmentRepository;
  balanceRepository: IBalanceRepository;
}) {
  const { investmentRepository, balanceRepository } = deps;

  return {
    async adicionarInvestimento(
      userId: string,
      typeInvestmentId: string,
      investedAmount: number,
      purchaseDate: Date,
      updateDate?: Date
    ) {
      if (!userId) throw new ValidationError("Usuário não autenticado.");
      if (!typeInvestmentId) {
        throw new ValidationError("Tipo de investimento não informado.");
      }
      if (!investedAmount || investedAmount <= 0) {
        throw new ValidationError("Valor inválido.");
      }
      if (!purchaseDate) {
        throw new ValidationError("Data de compra não informada.");
      }

      return investmentRepository.addInvestment(
        userId,
        typeInvestmentId,
        investedAmount,
        purchaseDate,
        updateDate
      );
    },

    async resgatarInvestimento(
      userId: string,
      typeInvestmentId: string,
      amountToRedeem: number
    ) {
      const investments =
        await investmentRepository.findInvestmentsWithApplications(
          userId,
          typeInvestmentId
        );
      if (!investments.length) {
        throw new ValidationError("Nenhum investimento encontrado");
      }

      let totalLiquidoDisponivel = 0;
      const rendimentoCalculados = [];

      for (const inv of investments) {
        const investedAmount =
          inv.aplicacoes
            ?.filter((a: any) => a.tipo === "aplicacao")
            .reduce((acc: number, cur: any) => acc + cur.valor, 0) ?? 0;
        const redeemAmount =
          inv.aplicacoes
            ?.filter((a: any) => a.tipo === "resgate")
            .reduce((acc: number, cur: any) => acc + cur.valor, 0) ?? 0;
        const valorLiquidoInvestido = investedAmount - redeemAmount;
        const rend = calcularRendimento(
          investedAmount,
          inv.tipoInvestimento.valorPercentual,
          inv.dataCompra,
          inv.tipoInvestimento.impostoRenda
        );

        const valorTotalLiquido =
          valorLiquidoInvestido + rend.rendimentoLiquido;
        totalLiquidoDisponivel += valorTotalLiquido;

        rendimentoCalculados.push({
          investimento: inv,
          ...rend,
          valorLiquidoInvestido,
          valorTotalLiquido,
        });
      }

      if (totalLiquidoDisponivel < amountToRedeem) {
        throw new ValidationError(
          "Valor para resgatar superior ao disponível."
        );
      }

      let restanteParaResgatar = amountToRedeem;
      let totalRedeemed = 0;
      const detalhesResgate = [];

      for (const rendInfo of rendimentoCalculados) {
        if (restanteParaResgatar <= 0) break;

        const {
          investimento,
          rendimentoLiquido,
          imposto,
          valorLiquidoInvestido,
          valorTotalLiquido,
        } = rendInfo;

        if (valorTotalLiquido <= restanteParaResgatar) {
          await investmentRepository.markInvestmentAsRedeemed(
            investimento.id
          );
          await investmentRepository.createRedemptionApplication(
            investimento.id,
            valorLiquidoInvestido
          );

          restanteParaResgatar -= valorTotalLiquido;
          totalRedeemed += valorTotalLiquido;

          detalhesResgate.push({
            id: investimento.id,
            tipo: "total",
            valorResgatado: valorTotalLiquido,
            dataCompra: investimento.dataCompra,
            rendimentoLiquido,
            imposto,
          });
        } else {
          const percentual = restanteParaResgatar / valorTotalLiquido;
          const valorParcialInvestido = valorLiquidoInvestido * percentual;

          await investmentRepository.createRedemptionApplication(
            investimento.id,
            valorParcialInvestido
          );

          totalRedeemed += restanteParaResgatar;

          detalhesResgate.push({
            id: investimento.id,
            tipo: "parcial",
            valorResgatado: restanteParaResgatar,
            dataCompra: investimento.dataCompra,
            rendimentoLiquido: rendimentoLiquido * percentual,
            imposto: imposto * percentual,
          });

          restanteParaResgatar = 0;
        }
      }

      await balanceRepository.incrementBalance(userId, totalRedeemed);

      return {
        message: "Resgate efetuado com sucesso!",
        valorTotalResgatado: Number(totalRedeemed.toFixed(2)),
        sobrouParaResgatar: Number(restanteParaResgatar.toFixed(2)),
        detalhes: detalhesResgate,
      };
    },

    async consultarInvestimentosPorTipo(
      userId: string,
      typeInvestmentId: string
    ) {
      const investments =
        await investmentRepository.findInvestmentsWithApplications(
          userId,
          typeInvestmentId
        );
      if (!investments.length) {
        throw new ValidationError(
          "Nenhum investimento ativo deste tipo encontrado"
        );
      }

      let valorTotalInvestido = 0;
      let valorTotalRendimentoBruto = 0;
      let valorTotalImposto = 0;
      let valorTotalRendimentoLiquido = 0;
      let valorTotalLiquido = 0;

      const extrato = investments.map((inv: any) => {
        const investedAmount =
          inv.aplicacoes
            ?.filter((a: any) => a.tipo === "aplicacao")
            .reduce((acc: number, cur: any) => acc + cur.valor, 0) ?? 0;

        const rendimento = calcularRendimento(
          investedAmount,
          inv.tipoInvestimento.valorPercentual,
          inv.dataCompra,
          inv.tipoInvestimento.impostoRenda
        );

        const valorLiquido = investedAmount + rendimento.rendimentoLiquido;

        valorTotalInvestido += investedAmount;
        valorTotalRendimentoBruto += rendimento.rendimentoBruto;
        valorTotalImposto += rendimento.imposto;
        valorTotalRendimentoLiquido += rendimento.rendimentoLiquido;
        valorTotalLiquido += valorLiquido;

        return {
          id: inv.id,
          dataCompra: inv.dataCompra,
          valorInvestido: Number(investedAmount.toFixed(2)),
          rendimentoBruto: Number(rendimento.rendimentoBruto.toFixed(2)),
          imposto: Number(rendimento.imposto.toFixed(2)),
          rendimentoLiquido: Number(rendimento.rendimentoLiquido.toFixed(2)),
          valorTotalLiquido: Number(valorLiquido.toFixed(2)),
        };
      });

      return {
        typeInvestmentId,
        nome: investments[0].tipoInvestimento.nome,
        valorTotalInvestido: Number(valorTotalInvestido.toFixed(2)),
        valorTotalRendimentoBruto: Number(
          valorTotalRendimentoBruto.toFixed(2)
        ),
        valorTotalImposto: Number(valorTotalImposto.toFixed(2)),
        valorTotalRendimentoLiquido: Number(
          valorTotalRendimentoLiquido.toFixed(2)
        ),
        valorTotalLiquido: Number(valorTotalLiquido.toFixed(2)),
        ultimasAplicacoes: extrato,
      };
    },

    async totalInvestido(userId: string) {
      if (!userId) throw new ValidationError("Usuário não autenticado.");
      const total =
        await investmentRepository.calculateTotalInvested(userId);
      return { totalInvestido: Number(total.toFixed(2)) };
    },

    async investimentosEfetuados(userId: string) {
      if (!userId) throw new ValidationError("Usuário não autenticado.");

      const investments =
        await investmentRepository.findInvestmentsWithApplications(
          userId
        );
      const valorTotalInvestido =
        await investmentRepository.calculateTotalInvested(userId);

      return { valorTotalInvestido, investments };
    },
  };
}
