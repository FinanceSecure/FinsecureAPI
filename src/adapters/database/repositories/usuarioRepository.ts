import { ObjectId } from "bson";
import { Usuario } from "../../../domain/entities/Usuario.js";
import { IUsuarioRepository } from "../../../application/ports/repositories/IUsuarioRepository.js";
import prisma from "../db.js";

export const usuarioRepository: IUsuarioRepository = {
  async encontrarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return null;

    return new Usuario(
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.senha
    );
  },

  async encontrarPorId(id: string): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) return null;

    return new Usuario(
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.senha
    );
  },

  async salvar(usuario: Usuario): Promise<Usuario> {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
      },
    });

    return new Usuario(
      novoUsuario.id,
      novoUsuario.nome,
      novoUsuario.email,
      novoUsuario.senha
    );
  },

  async atualizarEmail(emailAntigo: string, emailNovo: string) {
    await prisma.usuario.update({
      where: { email: emailAntigo },
      data: { email: emailNovo },
    });
  },

  async atualizarSenha(email: string, senhaHash: string) {
    await prisma.usuario.update({
      where: { email },
      data: { senha: senhaHash },
    });
  },

  async deletarPorId(usuarioId: string) {
    const objectId = new ObjectId(usuarioId);

    await prisma.saldo.deleteMany({
      where: { usuarioId: objectId.toString() },
    });
    await prisma.transacao.deleteMany({
      where: { usuarioId: objectId.toString() },
    });
    await prisma.investimento.deleteMany({
      where: { usuarioId: objectId.toString() },
    });
    await prisma.usuario.delete({ where: { id: objectId.toString() } });
  },
};
