import cron from "node-cron";
import {
  criarSaldoUseCases,
  criarTransacaoUseCases,
} from "@application/use-cases";
import { despesaRepository } from "../database/repositories/expenseRepository.js";
import { receitaRepository } from "../database/repositories/receitaRepository.js";
import { BalanceRepository } from "../database/repositories/";
import { transacaoRepository } from "../database/repositories/transacaoRepository.js";

const saldoUseCases = criarSaldoUseCases({
  balanceRepository: new BalanceRepository(),
  transacaoRepository,
  receitaRepository,
  despesaRepository,
});

const transacaoUseCases = criarTransacaoUseCases({
  transacaoRepository,
  recalcularSaldo: saldoUseCases.recalcularSaldo,
});

cron.schedule("0 0 * * * ", async () => {
  console.log("Executando liberação de transações pendentes...");
  await transacaoUseCases.liberarTransacoesPendentes();
});
