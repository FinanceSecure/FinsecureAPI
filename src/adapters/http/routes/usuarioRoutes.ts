import { autenticarToken } from "../middlewares/authMiddleware";
import express from "express";
import * as usuarioCtrll from "@adapters/api/controllers/usuarioController";

const router = express.Router();
const AT = [autenticarToken];

router.post("/cadastrar", usuarioCtrll.cadastro);
router.post("/login", usuarioCtrll.login);
router.post("/alterar-email", AT, usuarioCtrll.alterarEmail);
router.post("/alterar-senha", AT, usuarioCtrll.alterarSenha);
router.delete("/apagar-conta", AT, usuarioCtrll.removerUsuario);

export { router as usuario_routes };
