import { autenticarToken } from "../middlewares/authMiddleware";
import { Router } from "express";
import * as ReceitaController from "@/adapters/controllers/receitaController";

const router = Router();
const AT = [autenticarToken]

router.get("/verificar", AT, ReceitaController.Receitas);

router.get("/verificar/rendaFixa", AT, ReceitaController.ReceitaRendaFixa);
router.post("/adicionar/rendaFixa", AT, ReceitaController.AdicionarReceitaRendaFixa);
router.put("/alterar/rendaFixa", AT, ReceitaController.AlterarReceitaRendaFixa);
router.delete("/remover/rendaFixa", AT, ReceitaController.RemoverRendaFixa);

router.get("/verificar/rendaVariavel", AT, ReceitaController.ReceitaVariavel);
router.post("/adicionar/rendaVariavel", AT, ReceitaController.AdicionarReceitaRendaVariavel);
router.put("/alterar/rendaVariavel", AT, ReceitaController.AlterarRendaVariavel);
router.delete("/remover/rendaVariavel/:id", AT, ReceitaController.RemoverRendaVariavel);

export { router as receita_routes };
