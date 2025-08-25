import { Request, Response } from "express";
import { AlteracaoSenha, AlterarEmail, Cadastrar, Logar, Remover } from "../../application/services/usuario.service";

export async function cadastro(req: Request, res: Response) {
  try {
    const { nome, sobrenome, email, senha } = req.body;
    const novoUsuario = await Cadastrar(nome, sobrenome, email, senha);

    return res.status(200).json(novoUsuario);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Falha no servidor." });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;
    const login = await Logar(email, senha);

    return res.status(200).json(login)
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Erro interno" });
  }
}

export async function alterarEmail(req: Request, res: Response) {
  try {
    const { emailAntigo, emailNovo } = req.body;
    const emailAlterado = await AlterarEmail(emailAntigo, emailNovo);

    return res.status(200).json(emailAlterado);
  } catch (err: any) {
    return res.status(500).json({ Erro: err.message || "Erro interno" });
  }
}

export async function alterarSenha(req: Request, res: Response) {
  try {
    const { email, senhaAntiga, senhaNova } = req.body;
    const senhaAlterada = await AlteracaoSenha(email, senhaAntiga, senhaNova)

    return res.json({ senhaAlterada });
  } catch (err: any) {
    return res.status(500).json({ Erro: err.message || "Erro interno" });
  }
}

export async function removerUsuario(req: Request, res: Response) {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const remocao = await Remover(usuarioId)

    return res.status(200).json(remocao);
  } catch (err: any) {
    return res.status(500).json({ err: err.message || "Erro interno no servidor" });
  }
}
