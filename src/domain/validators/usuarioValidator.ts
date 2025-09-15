import { ErrosValidacao } from "../erros/validation";

type UsuarioLogin = {
  nome?: string;
  email?: string;
  senha?: string;
};

type UsuarioCadastrado = {
  nome: string;
  email: string;
  senha: string;
};

export const validarCamposCadastro = ({
  nome,
  email,
  senha,
}: UsuarioCadastrado) => {
  if (!nome || nome.trim() === "")
    throw new Error(ErrosValidacao.nomeObrigatorio);
  if (!email || email.trim() === "")
    throw new Error(ErrosValidacao.emailObrigatorio);
  if (!senha || senha.trim() === "")
    throw new Error(ErrosValidacao.senhaObrigatoria);
};

export const validarCamposLogin = ({ email, senha }: UsuarioLogin) => {
  if (!email || email.trim() === "")
    throw new Error(ErrosValidacao.emailObrigatorio);
  if (!senha || senha.trim() === "")
    throw new Error(ErrosValidacao.senhaObrigatoria);
};
