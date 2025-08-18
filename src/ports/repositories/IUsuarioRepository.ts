import { Usuario } from "../../domain/entities/Usuario";

export interface IUsuarioRepository {
	encontrarPorEmail(email: string): Promise<Usuario | null>;
	encontrarPorId(id: string): Promise<Usuario | null>;
	salvar(usuario: Usuario): Promise<Usuario>;
}
