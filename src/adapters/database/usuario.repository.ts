import { PrismaClient } from "@prisma/client";
import { IUsuarioRepository } from "../../ports/repositories/IUsuarioRepository";
import { Usuario } from "../../domain/entities/Usuario";

export class UsuarioPrismaRepository implements IUsuarioRepository {
  constructor(private prisma: PrismaClient) { }

  async encontrarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    return usuario ? new Usuario( usuario.id, usuario.email, usuario.senha,
      usuario.primeiro_nome, usuario.ultimo_nome, usuario.criado_data,
      usuario.atualizado_data) : null;
  }

  async encontrarPorId(id: number): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario ? new Usuario(
      usuario.id, usuario.email, usuario.senha,
      usuario.primeiro_nome, usuario.ultimo_nome, usuario.criado_data,
      usuario.atualizado_data) : null;
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const usuarioSalvo = await this.prisma.usuario.create({
      data: {
        email: usuario.email,
        senha: usuario.senhaHash,
        primeiro_nome: usuario.primeiroNome,
        ultimo_nome: usuario.ultimoNome,
      },
    });

    return new Usuario(
      usuarioSalvo.id, usuarioSalvo.email, 
      usuarioSalvo.senha, usuarioSalvo.primeiro_nome, 
      usuarioSalvo.ultimo_nome, usuarioSalvo.criado_data,
      usuarioSalvo.atualizado_data
    );
  }
}
