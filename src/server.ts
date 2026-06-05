import app from "./app.js";
import { startInvestmentYieldJob } from '@adapters/database/jobs/apply-daily-yield.js';
import { env } from "@shared/config";

if (env.runInvestmentYieldJob)
  startInvestmentYieldJob();

const PORT = env.port;
const HOST = env.host;

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });

    console.info(
      JSON.stringify({
        level: "info",
        event: "service_online",
        service: "financesecure-api",
        host: HOST,
        port: PORT,
        swaggerEnabled: env.enableSwagger,
      })
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "service_offline",
        service: "financesecure-api",
        error: err instanceof Error ? err.message : "Erro desconhecido ao subir a API.",
      })
    );
    app.log.error(err);
    process.exit(1);
  }
};

start();
