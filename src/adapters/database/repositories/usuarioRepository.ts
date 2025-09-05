import { Usuario } from "@/domain/entities/Usuario";
import { ObjectId } from "bson";
import prisma from "../db";

interface UsuarioCriacao {
  nome: string,
  email: string,
  senha: string
}

export const usuarioRepository = {
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) return null;

    return new Usuario(
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.senha
    );
  },

  async criarUsuario(data: UsuarioCriacao): Promise<Usuario> {
    const novoUsuario = await prisma.usuario.create({ data });
    return Object(novoUsuario);
  },

  async atualizarEmail(emailAntigo: string, emailNovo: string) {
    return await prisma.usuario.update({
      where: { email: emailAntigo },
      data: { email: emailNovo }
    });
  },

  async atualizarSenha(email: string, senhaHash: string) {
    return await prisma.usuario.update({
      where: { email },
      data: { senha: senhaHash }
    });
  },

  async deletarUsuario(usuarioId: string) {
    const objectId = new ObjectId(usuarioId)

    await prisma.saldo.deleteMany({ where: { usuarioId: objectId.toString() } });
    await prisma.transacao.deleteMany({ where: { usuarioId: objectId.toString() } });
    await prisma.investimento.deleteMany({ where: { usuarioId: objectId.toString() } });
    await prisma.usuario.delete({ where: { id: objectId.toString() } });

    return;
  }
};
