import { MensagensErro } from "../erros/validation";
import { usuarioRepository } from "@adapters/database/repositories/usuarioRepository";
import {
  BadRequestError,
  NotFoundError,
} from "@adapters/api/exceptions/HttpError";
import {
  validarCamposCadastro,
  validarCamposLogin,
} from "../validators/usuarioValidator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function Cadastrar(nome: string, email: string, senha: string) {
  validarCamposCadastro({ nome, email, senha });

  const usuarioExistente = await usuarioRepository.buscarPorEmail(email);
  if (usuarioExistente)
    throw new BadRequestError(MensagensErro.USUARIO.JA_CADASTRADO);

  const senhaHash = await bcrypt.hash(senha, 10);
  const novoUsuario = await usuarioRepository.criarUsuario({
    nome,
    email,
    senha: senhaHash,
  });

  return novoUsuario;
}

export async function Logar(email: string, senha: string) {
  validarCamposLogin({ email, senha });

  const usuario = await usuarioRepository.buscarPorEmail(email);
  const senhaValida = usuario ? await bcrypt.compare(senha, usuario.senha) : false;

  if (!usuario || !senhaValida) 
    throw new BadRequestError(MensagensErro.AUTH.CREDENCIAIS_INVALIDAS)

  const token = jwt.sign(
    {
      usuarioId: usuario.id,
      nome: usuario.nome,
    },
    process.env.JWT_SECRET || "segredo",
    { expiresIn: "2h" }
  );

  return {
    token,
    mensagem: "Login realizado com sucesso.",
  };
}

export async function Remover(usuarioId: string) {
  if (!usuarioId)
    throw new NotFoundError(MensagensErro.USUARIO.NAO_ENCONTRADO);

  await usuarioRepository.deletarUsuario(usuarioId);
  return "Usuário removido com sucesso!";
}

export async function AlterarEmail(emailAntigo: string, emailNovo: string) {
  const usuario = await usuarioRepository.buscarPorEmail(emailAntigo);
  if (!usuario)
    throw new NotFoundError(MensagensErro.USUARIO.NAO_ENCONTRADO);

  const emailCadastrado = await usuarioRepository.buscarPorEmail(emailNovo);
  if (emailCadastrado)
    throw new BadRequestError(MensagensErro.USUARIO.JA_CADASTRADO);

  await usuarioRepository.atualizarEmail(emailAntigo, emailNovo);

  return "E-mail alterado com sucesso";
}

export async function AlteracaoSenha(
  email: string,
  senhaAntiga: string,
  senhaNova: string
) {
  if (!email) 
    throw new BadRequestError(MensagensErro.VALIDACAO.EMAIL);
  if (!senhaAntiga) 
    throw new BadRequestError(MensagensErro.VALIDACAO.SENHA_ANTIGA);
  if (!senhaNova) 
    throw new BadRequestError(MensagensErro.VALIDACAO.SENHA_NOVA);

  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario) 
    throw new NotFoundError(MensagensErro.USUARIO.NAO_ENCONTRADO);

  const senhaValida = await bcrypt.compare(senhaAntiga, usuario.senha);
  if (!senhaValida) 
    throw new BadRequestError(MensagensErro.USUARIO.SENHA_ANTIGA_INCORRETA);

  const senhaHash = await bcrypt.hash(senhaNova, 10);
  await usuarioRepository.atualizarSenha(email, senhaHash);

  return "Senha alterada com sucesso.";
}
