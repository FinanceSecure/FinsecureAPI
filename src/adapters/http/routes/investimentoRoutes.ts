import { Router } from "express";
import { autenticarToken } from "@/adapters/http/middlewares/authMiddleware";
import {
  extrato,
  investir,
  resgatar
} from "@/adapters/controllers/investimentoController"
import {
  adicionarTipoInvestimento,
  verificarTipoInvestimento
} from "@/adapters/controllers/tipoInvestimentoController";

const router = Router();
router.get("/extrato/:id", autenticarToken, extrato);
router.post("/adicionar", autenticarToken, investir);
router.post("/resgatar/:id", autenticarToken, resgatar);
router.post("/tipo/adicionar", autenticarToken, adicionarTipoInvestimento)
router.get("/tipo/:id", autenticarToken, verificarTipoInvestimento)

export { router as investimento_routes };
