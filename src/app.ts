import express from 'express';
import dotenv from 'dotenv';
import {
  usuario_routes,
  transacao_routes,
  saldo_routes,
  investimento_routes
} from '@/adapters/http/routes';
import { erroMiddleware } from '@/infraestructure/middlewares/erroMiddleware';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/usuarios', usuario_routes);
app.use('/api/transacoes', transacao_routes);
app.use('/api/saldo', saldo_routes);
app.use('/api/investimento', investimento_routes)
app.use(erroMiddleware);

export default app;
