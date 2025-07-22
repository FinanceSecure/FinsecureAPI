import { Router } from 'express';
import { criarTransacao, alterarTransacao, cancelarTransacao } from '../controllers/transacao.controller';
import { validarTransacaoMiddleware } from '../middlewares/validarTransacao.middleware';
import { autenticarToken } from '../middlewares/auth.middleware';

const router = Router();

router.post("/adicionar", autenticarToken, validarTransacaoMiddleware, criarTransacao);
router.put('/alterar/:id', autenticarToken, validarTransacaoMiddleware, alterarTransacao);
router.delete('/cancelar-transacao/:id', autenticarToken, cancelarTransacao);

export { router as transacao_routes };
