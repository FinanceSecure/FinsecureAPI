import express from 'express';
import {
    cadastro,
    login,
    alterarEmail,
    alterarSenha,
    removerUsuario
} from '@/adapters/controllers/usuarioController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = express.Router();
router.post('/cadastrar', cadastro);
router.post('/login', login);
router.post('/alterar-email', alterarEmail);
router.post('/alterar-senha', alterarSenha);
router.delete('/apagar-conta', autenticarToken, removerUsuario);

export { router as usuario_routes };
