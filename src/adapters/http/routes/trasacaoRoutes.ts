import { autenticarToken } from "../middlewares/authMiddleware";
import { Router } from "express";
import { validarTransacaoMiddleware } from "../middlewares/validarTransacaoMiddleware";
import * as transacaoCtrll from "@/adapters/controllers/transacaoController";

const router = Router();
const authToken = [autenticarToken];
const validarTransacao = [validarTransacaoMiddleware];

router.post(
  "/adicionar",
  [...authToken, ...validarTransacao],
  transacaoCtrll.criarTransacao
);
router.put(
  "/alterar/:id",
  [...authToken, ...validarTransacao],
  transacaoCtrll.alterarTransacao
);
router.delete(
  "/cancelar-transacao/:id",
  authToken,
  transacaoCtrll.cancelarTransacao
);

export { router as transacao_routes };
