import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function cadastrarUsuario(req: Request, res: Response) {
  try {
    const { email, senha, primeiro_nome, ultimo_nome } = req.body;

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email, senha: senhaHash,
        primeiro_nome, ultimo_nome,
      },
    });
    res.status(201).json({ id: usuario.id, email: usuario.email });
  } catch (error) {
    res.status(500).json({ error: "Erro interno" });
  }
}

export async function loginUsuario(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) { return res.status(404).json({ error: "Usuário não encontrado" }); }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) { return res.status(401).json({ error: "Senha incorreta" }); }

    const token = jwt.sign(
      {
        usuarioId: usuario.id,
        primeiro_nome: usuario.primeiro_nome,
        ultimo_nome: usuario.ultimo_nome,
      },
      process.env.JWT_SECRET || "segredo",
      { expiresIn: "2h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro interno" });
  }
}

export async function alterarEmail(req: Request, res: Response) {
  try {
    const { emailAntigo, emailNovo } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email: emailAntigo } });
    if (!usuario) { return res.status(404).json({ error: "Usuário não encontrado" }); }

    const emailExistente = await prisma.usuario.findUnique({ where: { email: emailNovo } });
    if (emailExistente) { return res.status(409).json({ error: "E-mail já cadastrado" }); }

    await prisma.usuario.update({
      where: { email: emailAntigo },
      data: { email: emailNovo },
    });
    res.json({ message: "E-mail alterado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro interno" });
  }
}

export async function alterarSenha(req: Request, res: Response) {
  try {
    const { email, senhaAntiga, senhaNova } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) { return res.status(404).json({ error: "Usuário não encontrado" }); }

    const senhaValida = await bcrypt.compare(senhaAntiga, usuario.senha);
    if (!senhaValida) { return res.status(401).json({ error: "Senha antiga incorreta" }); }

    const senhaHash = await bcrypt.hash(senhaNova, 10);
    await prisma.usuario.update({
      where: { email },
      data: { senha: senhaHash },
    });

    res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro interno" });
  }
}

export async function removerUsuario(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    await prisma.saldo.deleteMany({ where: { usuario_id: usuarioId } });
    await prisma.transacao.deleteMany({ where: { usuario_id: usuarioId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });

    res.json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro interno" });
  }
}
