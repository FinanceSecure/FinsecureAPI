import { TipoTransacao } from "@prisma/client";
import { ValidationError } from "../errors/ApplicationError.js";
import { ITransacaoRepository } from "../ports/repositories/ITransacaoRepository.js";

export function criarTransacaoUseCases(deps: {
  transacaoRepository: ITransacaoRepository;
  recalcularSaldo: (userId: string) => Promise<number>;
}) {
  const { transacaoRepository, recalcularSaldo } = deps;

  return {
    async adicionarTransacao(
      userId: string,
      descricao: string,
      valor: number,
      data: Date,
      tipo: TipoTransacao
    ) {
      if (!userId) throw new ValidationError("Usuário não autenticado");

      if (!descricao || descricao.trim().length === 0)
        throw new ValidationError("A descrição é obrigatória");

      if (valor === undefined || valor === null)
        throw new ValidationError("O valor é obrigatório");

      if (!(data instanceof Date) || isNaN(data.getTime()))
        throw new ValidationError("Data inválida");

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataTransacao = new Date(data);
      dataTransacao.setHours(0, 0, 0, 0);

      const status = dataTransacao <= hoje ? "EFETIVADA" : "PENDENTE";

      const transacao = await transacaoRepository.criar({
        userId,
        descricao,
        valor,
        data,
        tipo,
        status,
      });

      const saldoAtual = await recalcularSaldo(userId);

      return { transacao, saldoAtual };
    },

    async atualizarTransacao(
      id: string,
      userId: string,
      descricao: string,
      valor: number,
      data: Date,
      tipo: TipoTransacao
    ) {
      if (!id) throw new ValidationError("ID da transação inválido");
      if (!userId) throw new ValidationError("Usuário não autenticado");
      if (valor === undefined) throw new ValidationError("Valor inválido");

      const transacaoExistente =
        await transacaoRepository.encontrarPorIdEUsuario(id, userId);

      if (!transacaoExistente) {
        throw new ValidationError(
          "Transação não encontrada ou não pertence a este usuário"
        );
      }

      const atualizada = await transacaoRepository.atualizar(id, {
        descricao,
        valor,
        data,
        tipo,
      });

      await recalcularSaldo(userId);
      return atualizada;
    },

    async excluirTransacao(id: string, userId: string) {
      if (!id) throw new ValidationError("ID da transação inválido");
      if (!userId) throw new ValidationError("Usuário não autenticado");

      const transacao =
        await transacaoRepository.encontrarPorIdEUsuario(id, userId);

      if (!transacao) {
        throw new ValidationError(
          "Transação não encontrada ou não pertence a este usuário"
        );
      }

      const removida = await transacaoRepository.remover(id);
      await recalcularSaldo(userId);
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
        await recalcularSaldo(transacao.userId);
      }
    },
  };
}
