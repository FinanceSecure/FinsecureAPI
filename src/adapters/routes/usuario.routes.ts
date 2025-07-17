import express from 'express';
import { cadastrarUsuario, 
    loginUsuario, 
    alterarEmail,
    alterarSenha
} from '../controllers/usuario.controller.js';

const router = express.Router();

router.post('/cadastrar', cadastrarUsuario);
router.post('/login', loginUsuario);
router.post('/alterar-email', alterarEmail);
router.post('/alterar-senha', alterarSenha);

export default router;
