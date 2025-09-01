import cron from "node-cron";
import { liberarTransacoesPendentes } from "../application/services/transacaoService";

cron.schedule("0 0 * * * ", async () => {
  console.log("Executando liberação de transações pendentes...")
  await liberarTransacoesPendentes();
});
