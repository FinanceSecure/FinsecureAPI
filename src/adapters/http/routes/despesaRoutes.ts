import { autenticarToken } from "@/adapters/http/middlewares/authMiddleware";
import { Router } from "express";
import * as DespesaController from "@/adapters/controllers/despesaController";

const router = Router();
const AT = [autenticarToken]

router.get("/verificar", AT, DespesaController.Despesas);
router.get("/:id", AT, DespesaController.DespesaPorId);
router.get("/agendadas", AT, DespesaController.DespesasAgendadas);
router.post("/adicionar", AT, DespesaController.AdicionarDespesa);

export { router as despesa_routes };
