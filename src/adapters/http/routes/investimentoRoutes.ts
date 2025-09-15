import { autenticarToken } from "@/adapters/http/middlewares/authMiddleware";
import { Router } from "express";
import * as invCtrll from "@/adapters/controllers/investimentoController";
import * as tipoInvCtrll from "@/adapters/controllers/tipoInvestimentoController";

const router = Router();

router.get("/extrato/:id", autenticarToken, invCtrll.extrato);
router.post("/adicionar", autenticarToken, invCtrll.investir);
router.post("/resgatar/:id", autenticarToken, invCtrll.resgatar);
router.post(
  "/tipo/adicionar",
  autenticarToken,
  tipoInvCtrll.adicionarTipoInvestimento
);
router.get(
  "/tipo/:id",
  autenticarToken,
  tipoInvCtrll.verificarTipoInvestimento
);

export { router as investimento_routes };
