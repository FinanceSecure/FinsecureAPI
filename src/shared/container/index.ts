import { UsuarioRepository } from "@adapters/database/repositories/usuarioRepository.js";
import { SaldoRepository } from "@adapters/database/repositories/saldoRepository.js";
import { criarUsuarioUseCases } from "@application/use-cases/usuarioUseCases.js";

export const usuarioUseCases = criarUsuarioUseCases({
  usuarioRepository: UsuarioRepository,
  saldoRepository: new SaldoRepository()
});
