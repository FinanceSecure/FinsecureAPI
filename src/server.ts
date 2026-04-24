import app from "./app.js";

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "0.0.0.0";

app.listen({ port: PORT, host: HOST })
  .then(() => {
    app.log.info(`Servidor rodando na porta ${PORT}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
