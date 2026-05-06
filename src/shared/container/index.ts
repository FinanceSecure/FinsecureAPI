import { UserRepository } from "@adapters/database/repositories/userRepository";
import { BalanceRepository } from "@/adapters/database/repositories/balanceRepository.js";
import { createUserUseCases } from "@/application/use-cases/userUseCases.js";

export const userUseCases = createUserUseCases({
  userRepository: new UserRepository(),
  balanceRepository: new BalanceRepository()
});
