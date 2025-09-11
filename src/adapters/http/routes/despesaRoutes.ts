import { autenticarToken } from "@/domain/middlewares/authMiddleware";
import { Router } from "express";
import { Despesas } from "@/adapters/controllers/despesaController";

const router = Router();
const AT = [autenticarToken]

router.get("/verificar", AT, Despesas);
router.get("/despesa/:id", AT);

/*
    router.get("/despesasPagas") ->     Despesas confirmadas
    router.get("/despesasNaoPagas") ->  Despesas agendadas
    router.get("/despesasPorFiltro") -> Entregar despesas voltados ao filtro selecionado
    router.get("/despesasVsrenda") ->   Entregar grafico comparativo entre os dois
*/

export { router as despesa_routes };
