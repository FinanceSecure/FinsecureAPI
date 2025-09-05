import { autenticarToken } from "../middlewares/authMiddleware";
import { Router } from "express";
import { verificarSaldo } from "@/adapters/controllers/saldoController";

const router = Router();
router.get("/verificar", autenticarToken, verificarSaldo);

export { router as saldo_routes };
