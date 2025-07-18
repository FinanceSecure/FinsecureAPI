import { Router } from 'express';
import { criarTransacao, alterarTransacao, cancelarTransacao } from '../controllers/transacao.controller';
import { validarTransacaoMiddleware } from '../middlewares/validarTransacao.middleware';
import { autenticarTokn } from '../middlewares/auth.middleware';

const router = Router();

router.post("/adicionar", autenticarTokn, validarTransacaoMiddleware, criarTransacao);
router.put('/alterar/:id', autenticarTokn, validarTransacaoMiddleware, alterarTransacao);
router.delete('/cancelar-transacao/:id', autenticarTokn, cancelarTransacao);

export { router as transacao_routes };
