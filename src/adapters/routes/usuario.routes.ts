import express from 'express';
import {
    cadastrarUsuario,
    loginUsuario,
    alterarEmail,
    alterarSenha,
    removerUsuario
} from '../controllers/usuario.controller.js';
import { autenticarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/cadastrar', cadastrarUsuario);
router.post('/login', loginUsuario);
router.post('/alterar-email', alterarEmail);
router.post('/alterar-senha', alterarSenha);

router.delete('/apagar-conta', autenticarToken, removerUsuario);

export { router as usuario_routes };
