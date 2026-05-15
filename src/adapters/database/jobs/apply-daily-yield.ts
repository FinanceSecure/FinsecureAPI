import cron from "node-cron";
import { InvestmentRepository } from "@adapters/database/repositories/investmentRepository.js";
import { ApplyDailyYieldUseCase } from "@application/use-cases/apply-daily-yieldUsecases";

const useCase = new ApplyDailyYieldUseCase(InvestmentRepository);

export function startInvestmentYieldJob() {
  cron.schedule("0 0 * * 1-5", async () => {
    console.log("[JOB] Aplicando rendimento diario...");

    const result = await useCase.execute();

    console.log("[JOB] Rendimento aplicado.", result);
  });
}
