import {
  IExpenseRepository,
  IReceitaRepository,
  IBalanceRepository,
  ITransacaoRepository,
} from "../ports/repositories";
import { ResourceNotFoundError, ValidationError } from "@application/errors";
import { ErroMessages } from "@domain/erros";

export function criarSaldoUseCases(deps: {
  balanceRepository: IBalanceRepository;
  transacaoRepository: ITransacaoRepository;
  receitaRepository: IReceitaRepository;
  despesaRepository: IExpenseRepository;
}) {
  const {
    balanceRepository,
    transacaoRepository,
    receitaRepository,
    despesaRepository,
  } = deps;

  return {
    async recalcularSaldo(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const [
        totalTransacoes,
        totalReceitas,
        totalDespesas,
      ] = await Promise.all([
        transacaoRepository.obterTotalEfetivadoPorUsuario(userId),
        receitaRepository.obterTotalReceitasPorUsuario(userId),
        despesaRepository.getTotalByUserId(userId),
      ]);

      const saldoAtualizado =
        Number(totalReceitas || 0) +
        Number(totalTransacoes || 0) -
        Number(totalDespesas || 0);

      const saldoExistente =
        await balanceRepository.obterSaldoPorUsuario(
          userId
        );

      if (saldoExistente) {
        await balanceRepository.atualizarSaldo(
          saldoExistente.id,
          saldoAtualizado
        );
      } else {
        await balanceRepository.criarSaldo(
          userId,
          saldoAtualizado
        );
      }

      return {
        mensagem: "Saldo recalculado com sucesso.",
        saldo: saldoAtualizado,
      };
    },

    async visualizarSaldo(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const saldo =
        await balanceRepository.obterSaldoPorUsuario(
          userId
        );

      if (!saldo) {
        return {
          mensagem: "Saldo localizado com sucesso.",
          saldo: { id: null, userId, valor: 0, dataAtualizacao: new Date() },
        };
      }

      return {
        mensagem: "Saldo localizado com sucesso.",
        saldo,
      };
    },

    async inicializarSaldo(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const saldoExistente =
        await balanceRepository.obterSaldoPorUsuario(
          userId
        );

      if (saldoExistente) {
        return {
          mensagem: "Saldo já existente.",
          saldo: saldoExistente,
        };
      }

      const novoSaldo =
        await balanceRepository.criarSaldo(
          userId,
          0
        );

      return {
        mensagem: "Saldo inicial criado com sucesso.",
        saldo: novoSaldo,
      };
    },

    async removerSaldo(userId: string) {
      if (!userId?.trim()) {
        throw new ValidationError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );
      }

      const saldoExistente =
        await balanceRepository.obterSaldoPorUsuario(
          userId
        );

      if (!saldoExistente) {
        throw new ResourceNotFoundError(
          ErroMessages.SALDO.NAO_ENCONTRADO
        );
      }

      return {
        mensagem: "Saldo removido com sucesso.",
      };
    },
  };
}
