import { autenticarToken } from "../middlewares/authMiddleware";
import { Router } from "express";
import { verificarSaldo } from "@adapters/api/controllers/saldoController";

const router = Router();
const AT = [autenticarToken];

router.get("/verificar", AT, verificarSaldo);

export { router as saldo_routes };
