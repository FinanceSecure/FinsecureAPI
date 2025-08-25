import prisma from "@/adapters/database/db";
import { IUsuarioRepository } from "@/ports/repositories/IUsuarioRepository";
import { Usuario } from "@/domain/entities/Usuario";
import { UsuarioCriacaoDTO } from "@/application/dtos/UsuarioCriacao";

export class UsuarioRepository implements IUsuarioRepository {
  private static fromPrisma(data: any): Usuario {
    if (!data || typeof data !== "object")
      throw new Error("Dados inválidos do Prisma");

    return new Usuario(
      data.id,
      data.nome,
      data.email,
      data.senha,
      data.criado,
      data.atualizado
    )
  }

  async encontrarPorEmail(email: string): Promise<Usuario | null> {
    const usuarioEncontrado = await prisma.usuario.findFirst({
      where: { email }
    });
    return usuarioEncontrado
      ? UsuarioRepository.fromPrisma(usuarioEncontrado)
      : null;
  }

  async encontrarPorId(id: string): Promise<Usuario | null> {
    const usuarioEncontrado = await prisma.usuario.findFirst({
      where: { id }
    });
    return usuarioEncontrado
      ? UsuarioRepository.fromPrisma(usuarioEncontrado)
      : null;
  }

  async criarUsuario(data: UsuarioCriacaoDTO): Promise<Usuario> {
    const novoUsuario = await prisma.usuario.create({ data });
    return UsuarioRepository.fromPrisma(novoUsuario);
  }

  async removerUsuario(usuarioId: string) {
    await prisma.saldo.deleteMany({ where: { usuarioId } });
    await prisma.transacao.deleteMany({ where: { usuarioId } });
    await prisma.investimento.deleteMany({ where: { usuarioId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    return;
  }

  async atualizarEmail(emailAntigo: string, emailNovo: string) {
    return await prisma.usuario.update({
      where: { email: emailAntigo },
      data: { email: emailNovo }
    });
  }

  async atualizarSenha(email: string, senhaHash: string) {
    return await prisma.usuario.update({
      where: { email },
      data: { senha: senhaHash }
    });
  }
}