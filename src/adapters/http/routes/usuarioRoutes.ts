import { autenticarToken } from "../middlewares/authMiddleware";
import express from "express";
import * as usuarioController from "@/adapters/controllers/usuarioController";

const router = express.Router();

router.post("/cadastrar", usuarioController.cadastro);
router.post("/login", usuarioController.login);
router.post("/alterar-email", autenticarToken, usuarioController.alterarEmail);
router.post("/alterar-senha", autenticarToken, usuarioController.alterarSenha);
router.delete("/apagar-conta", autenticarToken, usuarioController.removerUsuario);

export { router as usuario_routes };
