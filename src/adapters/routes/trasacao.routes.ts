import { Router } from 'express';
import { adicionarTransacao } from '../controllers/transacao.controller';
import { autenticarTokn } from '../../middlewares/authMiddleware';

const router = Router();

router.post("/adicionar", autenticarTokn, adicionarTransacao);

export default router;