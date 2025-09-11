import cron from "node-cron";
import { liberarTransacoesPendentes } from "@/domain/services/transacaoService";

cron.schedule("0 0 * * * ", async () => {
  console.log("Executando liberação de transações pendentes...")
  await liberarTransacoesPendentes();
});
