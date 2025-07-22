import { Router } from "express";
import { autenticarToken } from "../middlewares/auth.middleware";
import {
  buscarInvestimento,
  buscarInvestimentos,
  investir,
  resgatar
} from "../controllers/investimento.controller";
import {
  adicionarTipoInvestimento,
  verificarTipoInvestimento
} from "../controllers/tipoInvestimento.controller";

const router = Router();

router.post("/adicionar", autenticarToken, investir);
router.get("/buscar/:id", autenticarToken, buscarInvestimento)
router.get("/buscar/", autenticarToken, buscarInvestimentos)
router.delete("/resgatar/:id", autenticarToken, resgatar)
router.post("/tipo/adicionar", autenticarToken, adicionarTipoInvestimento)
router.get("/tipo/:id", autenticarToken, verificarTipoInvestimento)

export { router as investimento_routes };
