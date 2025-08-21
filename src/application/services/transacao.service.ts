import { atualizarSaldoUsuario } from "./saldo.service";
import prisma from "../../adapters/database/db";
import { TipoTransacao, Transacao } from "@prisma/client";

interface ResultadoAdicionarTransacao {
  transacao: Transacao;
  saldoAtual: number;
}

export async function adicionarTransacao(
  usuarioId: string,
  descricao: string,
  valor: number,
  data: Date,
  tipo: TipoTransacao
): Promise<ResultadoAdicionarTransacao> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataTransacao = new Date(data)
  dataTransacao.setHours(0, 0, 0, 0);

  const status = dataTransacao <= hoje ? "EFETIVADA" : "PENDENTE";
  const transacao = await prisma.transacao.create({
    data: {
      usuarioId,
      descricao,
      valor,
      data,
      tipo,
      status
    }
  });

  const saldo = await atualizarSaldoUsuario(usuarioId)

  return ({ transacao, saldoAtual: saldo });
}

export async function atualizarTransacao(
  id: string,
  usuarioId: string,
  descricao: string,
  valor: number,
  data: Date,
  tipo: TipoTransacao,
) {

  if (!id)
    throw new Error("ID da transação inválido");

  if (!usuarioId)
    throw new Error("Usuário não autenticado");

  const transacao = await prisma.transacao.findFirst({
    where: { id, usuarioId }
  });

  if (!transacao)
    throw new Error("Transação não encontrada ou não pertence a este usuário");

  const transacaoAtual = await prisma.transacao.update({
    where: { id },
    data: {
      descricao,
      valor,
      data,
      tipo
    }
  });

  return transacaoAtual;
}


export async function excluirTransacao(
  id: string,
  usuarioId: string,
) {
  const transacao = await prisma.transacao.findFirst({
    where: { id, usuarioId }
  });

  if (!id)
    throw new Error("Id da transação inválido");

  if (!usuarioId)
    throw new Error("Usuário não authenticado");

  if (!transacao)
    throw new Error("Transação não encontrada ou não pertece ao usuário");

  const transacaoRemovida = await prisma.transacao.delete({ where: { id } });

  return transacaoRemovida;
}

export async function liberarTransacoesPendentes() {
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const pendentes = await prisma.transacao.findMany({
    where: {
      status: "PENDENTE",
      data: { lte: hoje }
    }
  });

  for (const transacao of pendentes) {
    await prisma.transacao.update({
      where: { id: transacao.id },
      data: { status: "EFETIVADA" }
    });
    await atualizarSaldoUsuario(transacao.usuarioId);
  }
}
