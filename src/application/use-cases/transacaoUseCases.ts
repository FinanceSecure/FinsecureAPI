import { TipoTransacao } from "@prisma/client";
import { ValidationError } from "../errors/ApplicationError.js";
import { ITransacaoRepository } from "../ports/repositories/ITransacaoRepository.js";

export function criarTransacaoUseCases(deps: {
  transacaoRepository: ITransacaoRepository;
  recalcularSaldo: (usuarioId: string) => Promise<number>;
}) {
  const { transacaoRepository, recalcularSaldo } = deps;

  return {
    async adicionarTransacao(
      usuarioId: string,
      descricao: string,
      valor: number,
      data: Date,
      tipo: TipoTransacao
    ) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataTransacao = new Date(data);
      dataTransacao.setHours(0, 0, 0, 0);

      const status = dataTransacao <= hoje ? "EFETIVADA" : "PENDENTE";
      const transacao = await transacaoRepository.criar({
        usuarioId,
        descricao,
        valor,
        data,
        tipo,
        status,
      });

      const saldoAtual = await recalcularSaldo(usuarioId);
      return { transacao, saldoAtual };
    },

    async atualizarTransacao(
      id: string,
      usuarioId: string,
      descricao: string,
      valor: number,
      data: Date,
      tipo: TipoTransacao
    ) {
      if (!id) throw new ValidationError("ID da transação inválido");
      if (!usuarioId) throw new ValidationError("Usuário não autenticado");

      const transacao =
        await transacaoRepository.encontrarPorIdEUsuario(id, usuarioId);

      if (!transacao) {
        throw new ValidationError(
          "Transação não encontrada ou não pertence a este usuário"
        );
      }

      return transacaoRepository.atualizar(id, {
        descricao,
        valor,
        data,
        tipo,
      });
    },

    async excluirTransacao(id: string, usuarioId: string) {
      if (!id) throw new ValidationError("ID da transação inválido");
      if (!usuarioId) throw new ValidationError("Usuário não autenticado");

      const transacao =
        await transacaoRepository.encontrarPorIdEUsuario(id, usuarioId);

      if (!transacao) {
        throw new ValidationError(
          "Transação não encontrada ou não pertence a este usuário"
        );
      }

      const removida = await transacaoRepository.remover(id);
      await recalcularSaldo(usuarioId);
      return removida;
    },

    async liberarTransacoesPendentes() {
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);

      const pendentes =
        await transacaoRepository.listarPendentesAte(hoje);

      for (const transacao of pendentes) {
        await transacaoRepository.atualizarStatus(
          transacao.id,
          "EFETIVADA"
        );
        await recalcularSaldo(transacao.usuarioId);
      }
    },
  };
}
