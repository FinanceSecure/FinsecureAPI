import { Router } from "express";
import { autenticarToken } from "../middlewares/authMiddleware";
import { verificarSaldo } from "@/adapters/controllers/saldoController";

const router = Router();
router.get('/verificar', autenticarToken, verificarSaldo)

export { router as saldo_routes };
