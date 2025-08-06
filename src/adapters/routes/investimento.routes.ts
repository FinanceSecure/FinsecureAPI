import { Router } from "express";
import { autenticarToken } from "../middlewares/auth.middleware";
import {
  extrato,
  investir,
  resgatar
} from "../controllers/investimento.controller";
import {
  adicionarTipoInvestimento,
  verificarTipoInvestimento
} from "../controllers/tipoInvestimento.controller";

const router = Router();

router.get("/extrato/:id", autenticarToken, extrato);
router.post("/adicionar", autenticarToken, investir);
router.post("/resgatar/:id", autenticarToken, resgatar);

//Por tipo
router.post("/tipo/adicionar", autenticarToken, adicionarTipoInvestimento)
router.get("/tipo/:id", autenticarToken, verificarTipoInvestimento)

export { router as investimento_routes };
