import { Usuario } from "@prisma/client";
import prisma from "../../adapters/database/db";

interface UsuarioCriacao {
  nome: string,
  email: string,
  senha: string
}

export const usuarioRepository = {
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return await prisma.usuario.findUnique({ where: { email } })
  },

  async criarUsuario(data: UsuarioCriacao): Promise<Usuario> {
    return await prisma.usuario.create({ data });
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
    await prisma.saldo.deleteMany({ where: { usuarioId } });
    await prisma.transacao.deleteMany({ where: { usuarioId } });
    await prisma.investimento.deleteMany({ where: { usuarioId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    return;
  }
};
