import { liberarTransacoesPendentes } from "@domain/services/transacaoService";
import cron from "node-cron";

cron.schedule("0 0 * * * ", async () => {
  console.log("Executando liberação de transações pendentes...");
  await liberarTransacoesPendentes();
});
