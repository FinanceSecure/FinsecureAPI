import { erroMiddleware } from "@/infraestructure/middlewares/erroMiddleware";
import * as routes from "@/adapters/http/routes";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/usuarios", routes.usuario_routes);
app.use("/api/transacoes", routes.transacao_routes);
app.use("/api/saldo", routes.saldo_routes);
app.use("/api/investimento", routes.investimento_routes);
app.use("/api/despesa", routes.despesa_routes);
app.use("/api/receita", routes.receita_routes);
app.use(erroMiddleware);

export default app;
