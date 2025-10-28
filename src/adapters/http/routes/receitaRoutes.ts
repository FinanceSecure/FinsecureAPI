import { autenticarToken } from "../middlewares/authMiddleware";
import { Router } from "express";
import * as ReceitaController from "@/adapters/controllers/receitaController";

const router = Router();
const AT = [autenticarToken]

router.get("/verificar", AT, ReceitaController.Receitas);
router.get("/verificar/rendaFixa", AT, ReceitaController.ReceitaRendaFixa);
router.get("/verificar/rendaVariavel", AT, ReceitaController.ReceitaVariavel);
router.get("/verificar/:id", AT);

export { router as receita_routes };
