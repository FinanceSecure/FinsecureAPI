import bcrypt from "bcrypt";
import prisma from "../../db";
import jwt from "jsonwebtoken";
import { validarCamposCadastro, validarCamposLogin } from "../../domain/validators/usuarioValidator";
import { ErrosUsuario } from "../../domain/erros/validation";
import { usuarioRepository } from "../../infraestructure/repositories/usuarioRepository";

export async function Cadastrar(
  nome: string,
  email: string,
  senha: string
) {
  validarCamposCadastro({ nome, email, senha });

  const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
  if (usuarioExistente) throw new Error("E-mail já cadastrado");

  const senhaHash = await bcrypt.hash(senha, 10);
  const novoUsuario = await usuarioRepository.criarUsuario({
    nome,
    email,
    senha: senhaHash
  });

  return novoUsuario;
}

export async function Logar(
  email: string,
  senha: string
) {
  validarCamposLogin({ email, senha });

  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario) throw new Error(ErrosUsuario.naoEncontrado);

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) throw new Error(ErrosUsuario.senhaIncorreta);

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
    mensagem: "Login realizado com sucesso."
  };
}

export async function Remover(
  usuarioId: string
) {
  if (!usuarioId) throw new Error(ErrosUsuario.naoEncontrado);

  usuarioRepository.deletarUsuario(usuarioId);

  return "Usuário removido com sucesso!";
}

export async function AlterarEmail(
  emailAntigo: string,
  emailNovo: string
) {
  const usuario = await usuarioRepository.buscarPorEmail(emailAntigo);
  if (!usuario) throw new Error(ErrosUsuario.naoEncontrado);

  const emailCadastrado = await usuarioRepository.buscarPorEmail(emailNovo);
  if (emailCadastrado) throw new Error(ErrosUsuario.jaCadastrado);

  await usuarioRepository.atualizarEmail(emailAntigo, emailNovo)

  return "E-mail alterado com sucesso";
}

export async function AlteracaoSenha(
  email: string,
  senhaAntiga: string,
  senhaNova: string
) {
  if (!email) throw new Error("E-mail não informado.");
  if (!senhaAntiga) throw new Error("Senha anterior não informada.");
  if (!senhaNova) throw new Error("Senha nova não informada.");

  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario) throw new Error("Usuário não encontrado.");

  const senhaValida = await bcrypt.compare(senhaAntiga, usuario.senha);
  if (!senhaValida) throw new Error("Senha antiga incorreta");

  const senhaHash = await bcrypt.hash(senhaNova, 10);
  await usuarioRepository.atualizarSenha(email, senhaHash)

  return "Senha alterada com sucesso.";
}
