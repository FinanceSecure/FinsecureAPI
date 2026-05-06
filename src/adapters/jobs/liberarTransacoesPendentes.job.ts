import cron from "node-cron";
import {
  createBalanceUseCases,
  createTransactionUseCases,
} from "@application/use-cases";
import { ExpenseRepository } from "../database/repositories/expenseRepository.js";
import { IncomeRepository } from "../database/repositories/incomeRepository.js";
import { BalanceRepository } from "../database/repositories/balanceRepository.js";
import { TransactionRepository } from "../database/repositories/transactionRepository.js";

const balanceUseCases = createBalanceUseCases({
  balanceRepository: new BalanceRepository(),
  transactionRepository: TransactionRepository,
  incomeRepository: IncomeRepository,
  expenseRepository: ExpenseRepository,
});

const transactionUseCases = createTransactionUseCases({
  transactionRepository: TransactionRepository,
  recalculateBalance: async (userId: string) => {
    const result = await balanceUseCases.recalculateBalance(userId);
    return result.balance;
  },
});

cron.schedule("0 0 * * * ", async () => {
  console.log("Executando liberação de transações pendentes...");
  await transactionUseCases.releasePendingTransactions();
});
