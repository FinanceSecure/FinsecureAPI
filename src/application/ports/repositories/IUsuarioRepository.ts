import { Usuario } from "../../../domain/entities/Usuario.js";

export interface IUsuarioRepository {
  encontrarPorEmail(email: string): Promise<Usuario | null>;
  encontrarPorId(id: string): Promise<Usuario | null>;
  salvar(usuario: Usuario): Promise<Usuario>;
  atualizarEmail(emailAntigo: string, emailNovo: string): Promise<void>;
  atualizarSenha(email: string, senhaHash: string): Promise<void>;
  deletarPorId(usuarioId: string): Promise<void>;
}
