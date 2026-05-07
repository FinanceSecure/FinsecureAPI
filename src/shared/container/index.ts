import { UserRepository } from "@/adapters/database/repositories";
import { createUserUseCases } from "@/application/use-cases";

export const userUseCases = createUserUseCases({
  userRepository: new UserRepository(),
});
