import { Request, Response } from "express";
import {
  AlteracaoSenha,
  AlterarEmail,
  Cadastrar,
  Logar,
  Remover
} from "@/application/services/usuarioService";

const errorHandler = (err: unknown) => {
  if (err instanceof Error) {
    return err.message;
  }
  return "Erro interno";
};

export async function cadastro(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body;
    const novoUsuario = await Cadastrar(nome, email, senha);

    return res.status(200).json(novoUsuario);
  } catch (err) {
    return res.status(500).json(errorHandler(err));
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;
    const login = await Logar(email, senha);

    return res.status(200).json(login)
  } catch (err: any) {
    return res.status(err.status).json(errorHandler(err));
  }
}

export async function alterarEmail(req: Request, res: Response) {
  try {
    const { emailAntigo, emailNovo } = req.body;
    const emailAlterado = await AlterarEmail(emailAntigo, emailNovo);

    return res.status(200).json(emailAlterado);
  } catch (err: any) {
    return res.status(500).json(errorHandler(err));
  }
}

export async function alterarSenha(req: Request, res: Response) {
  try {
    const { email, senhaAntiga, senhaNova } = req.body;
    const senhaAlterada = await AlteracaoSenha(email, senhaAntiga, senhaNova)

    return res.json({ senhaAlterada });
  } catch (err: any) {
    return res.status(500).json(errorHandler(err));
  }
}

export async function removerUsuario(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const remocao = await Remover(String(usuarioId))

    return res.status(200).json(remocao);
  } catch (err: any) {
    return res.status(500).json(errorHandler(err));
  }
}
