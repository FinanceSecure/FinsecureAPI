import { Router } from "express";
import { autenticarTokn } from "../middlewares/auth.middleware";
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

router.post("/adicionar", autenticarTokn, investir);
router.get("/buscar/:id", autenticarTokn, buscarInvestimento)
router.get("/buscar/", autenticarTokn, buscarInvestimentos)
router.delete("/resgatar/:id", autenticarTokn, resgatar)
router.post("/tipo/adicionar", autenticarTokn, adicionarTipoInvestimento)
router.get("/tipo/:id", autenticarTokn, verificarTipoInvestimento)

export { router as investimento_routes };
