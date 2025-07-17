import express from 'express';
import dotenv from 'dotenv';
import serverRoutes from './adapters/routes/index.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/usuarios', serverRoutes.usuario_routes);
app.use('/api/transacoes', serverRoutes.transacao_routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
