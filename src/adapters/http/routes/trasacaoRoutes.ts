import { autenticarToken } from "../middlewares/authMiddleware";
import { Router } from "express";
import { validarTransacaoMiddleware } from "../middlewares/validarTransacaoMiddleware";
import * as transacaoCtrll from "@/adapters/controllers/transacaoController";

const router = Router();
const AT = [autenticarToken];
const validarTransacao = [validarTransacaoMiddleware];

router.post(
  "/adicionar",
  [...AT, ...validarTransacao],
  transacaoCtrll.criarTransacao
);
router.put(
  "/alterar/:id",
  [...AT, ...validarTransacao],
  transacaoCtrll.alterarTransacao
);
router.delete(
  "/cancelar-transacao/:id",
  AT,
  transacaoCtrll.cancelarTransacao
);

export { router as transacao_routes };
