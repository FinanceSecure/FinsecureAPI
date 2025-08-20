import { Router } from "express";

import { autenticarToken } from "../middlewares/auth.middleware";
import { verificarSaldo } from "../controllers/saldo.controller";

const router = Router();

router.get('/verificar', autenticarToken, verificarSaldo)

export { router as saldo_routes };
