import {
  IDespesaRepository,
  IReceitaRepository,
  ISaldoRepository,
  ITransacaoRepository,
} from "../ports/repositories/index.js";

import {
  ResourceNotFoundError,
  ValidationError,
} from "../errors/ApplicationError.js";

import { MensagensErro } from "../../domain/erros/validation.js";

export function criarSaldoUseCases(deps: {
  saldoRepository: ISaldoRepository;
  transacaoRepository: ITransacaoRepository;
  receitaRepository: IReceitaRepository;
  despesaRepository: IDespesaRepository;
}) {
  const {
    saldoRepository,
    transacaoRepository,
    receitaRepository,
    despesaRepository,
  } = deps;

  return {
    async recalcularSaldo(usuarioId: string) {
      if (!usuarioId?.trim()) {
        throw new ValidationError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      const [
        totalTransacoes,
        totalReceitas,
        totalDespesas,
      ] = await Promise.all([
        transacaoRepository.obterTotalEfetivadoPorUsuario(
          usuarioId
        ),
        receitaRepository.obterTotalReceitasPorUsuario(
          usuarioId
        ),
        despesaRepository.obterTotalDespesasPorUsuario(
          usuarioId
        ),
      ]);

      const saldoAtualizado =
        Number(totalReceitas || 0) +
        Number(totalTransacoes || 0) -
        Number(totalDespesas || 0);

      const saldoExistente =
        await saldoRepository.obterSaldoPorUsuario(
          usuarioId
        );

      if (saldoExistente) {
        await saldoRepository.atualizarSaldo(
          saldoExistente.id,
          saldoAtualizado
        );
      } else {
        await saldoRepository.criarSaldo(
          usuarioId,
          saldoAtualizado
        );
      }

      return {
        mensagem: "Saldo recalculado com sucesso.",
        saldo: saldoAtualizado,
      };
    },

    async visualizarSaldo(usuarioId: string) {
      if (!usuarioId?.trim()) {
        throw new ValidationError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      const saldo =
        await saldoRepository.obterSaldoPorUsuario(
          usuarioId
        );

      if (!saldo) {
        throw new ResourceNotFoundError(
          "Saldo não encontrado."
        );
      }

      return {
        mensagem: "Saldo localizado com sucesso.",
        saldo,
      };
    },

    async inicializarSaldo(usuarioId: string) {
      if (!usuarioId?.trim()) {
        throw new ValidationError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      const saldoExistente =
        await saldoRepository.obterSaldoPorUsuario(
          usuarioId
        );

      if (saldoExistente) {
        return {
          mensagem: "Saldo já existente.",
          saldo: saldoExistente,
        };
      }

      const novoSaldo =
        await saldoRepository.criarSaldo(
          usuarioId,
          0
        );

      return {
        mensagem: "Saldo inicial criado com sucesso.",
        saldo: novoSaldo,
      };
    },

    async removerSaldo(usuarioId: string) {
      if (!usuarioId?.trim()) {
        throw new ValidationError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      const saldoExistente =
        await saldoRepository.obterSaldoPorUsuario(
          usuarioId
        );

      if (!saldoExistente) {
        throw new ResourceNotFoundError(
          "Saldo não encontrado."
        );
      }

      return {
        mensagem: "Saldo removido com sucesso.",
      };
    },
  };
}