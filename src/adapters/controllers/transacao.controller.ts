import { Request, Response } from 'express';
import {
  adicionarTransacao,
  atualizarTransacao,
  excluirTransacao
} from '../../application/services/transacao.service';

export async function criarTransacao(req: Request, res: Response) {
  return adicionarTransacao(req, res)
}

export async function alterarTransacao(req: Request, res: Response) {
  return atualizarTransacao(req, res);
}

export async function cancelarTransacao(req: Request, res: Response) {
  return excluirTransacao(req, res);
}
