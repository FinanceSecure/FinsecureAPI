import express from 'express';
import dotenv from 'dotenv';
import {
  usuario_routes,
  transacao_routes,
  saldo_routes
} from './adapters/routes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/usuarios', usuario_routes);
app.use('/api/transacoes', transacao_routes);
app.use('/api/saldo', saldo_routes)

export default app;
