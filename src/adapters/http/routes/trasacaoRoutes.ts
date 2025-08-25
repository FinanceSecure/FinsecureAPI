import { Router } from 'express';
import { 
  criarTransacao, 
  alterarTransacao, 
  cancelarTransacao 
} from '../controllers/transacaoController';
import { validarTransacaoMiddleware } from '../middlewares/validarTransacaoMiddleware';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post("/adicionar", autenticarToken, validarTransacaoMiddleware, criarTransacao);
router.put('/alterar/:id', autenticarToken, validarTransacaoMiddleware, alterarTransacao);
router.delete('/cancelar-transacao/:id', autenticarToken, cancelarTransacao);

export { router as transacao_routes };
