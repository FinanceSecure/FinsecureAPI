import { Router } from "express";

import { autenticarTokn } from "../middlewares/auth.middleware";
import { verificarSaldo } from "../controllers/saldo.controller";

const router = Router();

router.get('/verificar/:id', autenticarTokn, verificarSaldo)

export { router as saldo_routes };
