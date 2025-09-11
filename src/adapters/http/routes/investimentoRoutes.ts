import { autenticarToken } from "@/domain/middlewares/authMiddleware";
import { Router } from "express";
import * as invCtrll from "@/adapters/controllers/investimentoController"
import * as tipoInvCtrll from "@/adapters/controllers/tipoInvestimentoController";

const router = Router();
const AT = [autenticarToken]

router.get("/extrato/:id", AT, invCtrll.extrato);
router.post("/adicionar", AT, invCtrll.investir);
router.post("/resgatar/:id", AT, invCtrll.resgatar);
router.get("/totalInvestido", AT, invCtrll.valorInvestimentos);
router.post("/tipo/adicionar", AT, tipoInvCtrll.adicionarTipoInvestimento);
router.get("/tipo/:id", AT, tipoInvCtrll.verificarTipoInvestimento);

export { router as investimento_routes };
