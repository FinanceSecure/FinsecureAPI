import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { adicionarTransacao, atualizarTransacao, excluirTransacao } from '../../ports/services/transacao.service';

const prisma = new PrismaClient();

export async function criarTransacao(req: Request, res: Response) {
  return adicionarTransacao(req, res)
}

export async function alterarTransacao(req: Request, res: Response) {
  return atualizarTransacao(req, res);
}

export async function cancelarTransacao(req: Request, res: Response) {
  return excluirTransacao(req, res);
}
