import bcrypt from "bcrypt";
import prisma from "../../db";
import jwt from "jsonwebtoken";

export async function Cadastrar(
  nome: string,
  sobrenome: string,
  email: string,
  senha: string
) {
  if (!nome) throw new Error("Nome não informado");
  if (!sobrenome) throw new Error("Nome não informado");
  if (!email) throw new Error("Nome não informado");
  if (!senha) throw new Error("Nome não informado");

  const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
  if (usuarioExistente) throw new Error("E-mail já cadastrado");

  const senhaHash = await bcrypt.hash(senha, 10);
  const novoUsuario = await prisma.usuario.create({
    data: {
      nome,
      sobrenome,
      email,
      senha: senhaHash
    }
  });

  return novoUsuario;
}

export async function Logar(
  email: string,
  senha: string
) {
  if (!email) throw new Error("E-mail não informado.");
  if (!senha) throw new Error("Senha não informada.");

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) throw new Error("Usuário não encontrado.");

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) throw new Error("Senha incorreta.");

  const token = jwt.sign(
    {
      usuarioId: usuario.id,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome
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
  if (!usuarioId) throw new Error("Nenhum usuário encontrado.");

  await prisma.saldo.deleteMany({ where: { usuarioId } });
  await prisma.transacao.deleteMany({ where: { usuarioId } });
  await prisma.investimento.deleteMany({ where: { usuarioId } });
  await prisma.usuario.delete({ where: { id: usuarioId } });

  return "Usuário removido com sucesso!";
}

export async function AlterarEmail(
  emailAntigo: string,
  emailNovo: string
) {

  const usuario = await prisma.usuario.findUnique({
    where: { email: emailAntigo }
  });
  if (!usuario) throw new Error("Usuário não encontrado.");

  const emailCadastrado = await prisma.usuario.findUnique({
    where: { email: emailNovo }
  });

  if (emailCadastrado) throw new Error("E-mail já cadastrado.");

  await prisma.usuario.update({
    where: { email: emailAntigo },
    data: { email: emailNovo }
  });

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

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) throw new Error("Usuário não encontrado.");

  const senhaValida = await bcrypt.compare(senhaAntiga, usuario.senha);
  if (!senhaValida) throw new Error("Senha antiga incorreta");

  const senhaHash = await bcrypt.hash(senhaNova, 10);
  await prisma.usuario.update({
    where: { email },
    data: { senha: senhaHash }
  });

  return "Senha alterada com sucesso.";
}
