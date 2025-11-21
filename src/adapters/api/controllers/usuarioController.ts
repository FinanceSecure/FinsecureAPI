import { AuthRequest } from "@adapters/http/middlewares/authMiddleware";
import { Request, Response } from "express";
import * as usuarioService from "@domain/services/usuarioService";

export async function cadastro(req: Request, res: Response) {
  const { nome, email, senha } = req.body;
  const novoUsuario = await usuarioService.Cadastrar(nome, email, senha);

  return res.status(200).json(novoUsuario);
}

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;
  const login = await usuarioService.Logar(email, senha);

  return res.status(200).json(login);
}

export async function alterarEmail(req: Request, res: Response) {
  const { emailAntigo, emailNovo } = req.body;
  const emailAlterado = await usuarioService.AlterarEmail(
    emailAntigo,
    emailNovo
  );

  return res.status(200).json(emailAlterado);
}

export async function alterarSenha(req: Request, res: Response) {
  const { email, senhaAntiga, senhaNova } = req.body;
  const senhaAlterada = await usuarioService.AlteracaoSenha(
    email,
    senhaAntiga,
    senhaNova
  );

  return res.status(200).json(senhaAlterada);
}

export async function removerUsuario(req: AuthRequest, res: Response) {
  const usuarioId = req.user?.usuarioId;
  const remocao = await usuarioService.Remover(String(usuarioId));

  return res.status(200).json(remocao);
}
