import cron from "node-cron";
import {
  criarSaldoUseCases,
  criarTransacaoUseCases,
} from "../../application/use-cases/index.js";
import { despesaRepository } from "../database/repositories/despesaRepository.js";
import { receitaRepository } from "../database/repositories/receitaRepository.js";
import { SaldoRepository } from "../database/repositories/saldoRepository.js";
import { transacaoRepository } from "../database/repositories/transacaoRepository.js";

const saldoUseCases = criarSaldoUseCases({
  saldoRepository: new SaldoRepository(),
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
