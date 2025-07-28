import { Router } from "express";
import { autenticarToken } from "../middlewares/auth.middleware";
import {
  buscarInvestimento,
  consultarPorTipo,
  investir,
  listarInvestimentosController,
  resgatar
} from "../controllers/investimento.controller";
import {
  adicionarTipoInvestimento,
  verificarTipoInvestimento
} from "../controllers/tipoInvestimento.controller";

const router = Router();

router.get("/", autenticarToken, listarInvestimentosController);
router.get("/:id", autenticarToken, buscarInvestimento)
router.get("/consultar/tipo/:tipoInvestimentoId", autenticarToken, consultarPorTipo)

router.post("/adicionar", autenticarToken, investir);
// router.get("/buscar/:id", autenticarToken, buscarInvestimento)
// router.get("/buscar/", autenticarToken, buscarInvestimentos)
router.delete("/resgatar", autenticarToken, resgatar)
router.post("/tipo/adicionar", autenticarToken, adicionarTipoInvestimento)
router.get("/tipo/:id", autenticarToken, verificarTipoInvestimento)

export { router as investimento_routes };
