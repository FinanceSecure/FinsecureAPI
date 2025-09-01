import { Router } from 'express';
import {
  alterarTransacao,
  cancelarTransacao,
  criarTransacao
} from '@/adapters/controllers/transacaoController';
import { autenticarToken } from '../middlewares/authMiddleware';
import { validarTransacaoMiddleware } from '../middlewares/validarTransacaoMiddleware';

const router = Router();
router.post("/adicionar", autenticarToken, validarTransacaoMiddleware, criarTransacao);
router.put('/alterar/:id', autenticarToken, validarTransacaoMiddleware, alterarTransacao);
router.delete('/cancelar-transacao/:id', autenticarToken, cancelarTransacao);

export { router as transacao_routes };
