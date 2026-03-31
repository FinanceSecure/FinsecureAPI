import { MensagensErro } from "../erros/validation";

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
    throw new Error(MensagensErro.VALIDACAO.NOME);
  if (!email || email.trim() === "")
    throw new Error(MensagensErro.VALIDACAO.EMAIL);
  if (!senha || senha.trim() === "")
    throw new Error(MensagensErro.VALIDACAO.SENHA);
};

export const validarCamposLogin = ({ email, senha }: UsuarioLogin) => {
  if (!email || email.trim() === "")
    throw new Error(MensagensErro.AUTH.CREDENCIAIS_INVALIDAS);
  if (!senha || senha.trim() === "")
    throw new Error(MensagensErro.AUTH.CREDENCIAIS_INVALIDAS);
};
