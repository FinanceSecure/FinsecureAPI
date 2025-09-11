import { autenticarToken } from "../../../domain/middlewares/authMiddleware";
import express from "express";
import * as usuarioCtrll from "@/adapters/controllers/usuarioController";

const router = express.Router();

router.post("/cadastrar", usuarioCtrll.cadastro);
router.post("/login", usuarioCtrll.login);
router.post("/alterar-email", autenticarToken, usuarioCtrll.alterarEmail);
router.post("/alterar-senha", autenticarToken, usuarioCtrll.alterarSenha);
router.delete("/apagar-conta", autenticarToken, usuarioCtrll.removerUsuario);

export { router as usuario_routes };
