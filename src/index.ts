import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import usuarioRoutes from './adapters/routes/usuario.routes.js';

const app = express();
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
