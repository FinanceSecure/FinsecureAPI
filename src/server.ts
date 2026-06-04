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

    app.log.info({
      host: HOST,
      port: PORT,
      swaggerEnabled: env.enableSwagger,
    }, "FinanceSecureAPI started");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
