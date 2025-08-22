import { Request, Response } from 'express';
import {
  adicionarTransacao,
  atualizarTransacao,
  excluirTransacao
} from '../../application/services/transacaoService';

export async function criarTransacao(req: Request, res: Response) {
  try {
    const dados = req.body.validated;
    const resultado = await adicionarTransacao(
      dados.usuarioId,
      dados.descricao,
      dados.valor,
      dados.data,
      dados.tipo,
    );
    res.status(201).json(resultado)
  }
  catch (err) {
    return res.status(500).json({ message: "Falha no servidor" });
  }
}

export async function alterarTransacao(req: Request, res: Response) {
  try {
    const id = (req.params.id);
    const usuarioId = req.user?.usuarioId;

    if (!id)
      return res.status(400).json({ message: "Transação não encontrada" });

    if (!usuarioId)
      return res.status(401).json({ message: "Usuário não autenticado" });

    const { descricao, valor, data, tipo } = req.body;

    const transacaoAtualizada = await atualizarTransacao(
      id, usuarioId, descricao, valor, new Date(data), tipo
    );

    return res.status(200).json(transacaoAtualizada);
  }
  catch (err: any) {
    return res.status(400).json({ message: err.message || "Erro ao atualizar transação." });
  }
}

export async function cancelarTransacao(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const usuarioId = req.user?.usuarioId;

    if (!id)
      return res.status(400).json({ message: "Transação não encontrada" });

    if (!usuarioId)
      return res.status(401).json({ message: "Usuário não autenticado." });

    const transacaoExcluida = await excluirTransacao(id, usuarioId)

    return res.status(200).json(transacaoExcluida);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Erro ao remover transação." });
  }
}
