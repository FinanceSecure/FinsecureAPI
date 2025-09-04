import { Request, Response } from "express";
import {
  AlteracaoSenha,
  AlterarEmail,
  Cadastrar,
  Logar,
  Remover
} from "@/domain/services/usuarioService";

export async function cadastro(req: Request, res: Response) {
  const { nome, email, senha } = req.body;
  const novoUsuario = await Cadastrar(nome, email, senha);

  return res.status(200).json(novoUsuario);
}

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;
  const login = await Logar(email, senha);

  return res.status(200).json(login);
}

export async function alterarEmail(req: Request, res: Response) {
  const { emailAntigo, emailNovo } = req.body;
  const emailAlterado = await AlterarEmail(emailAntigo, emailNovo);

  return res.status(200).json(emailAlterado);
}

export async function alterarSenha(req: Request, res: Response) {
  const { email, senhaAntiga, senhaNova } = req.body;
  const senhaAlterada = await AlteracaoSenha(email, senhaAntiga, senhaNova);

  return res.status(200).json(senhaAlterada);
}

export async function removerUsuario(req: Request, res: Response) {
  const usuarioId = req.user?.usuarioId;
  const remocao = await Remover(String(usuarioId));

  return res.status(200).json(remocao);
}
