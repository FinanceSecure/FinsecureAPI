import { MensagensErro } from "@domain/erros/validation.js";
import { ValidationError } from "../errors/ApplicationError.js";

type UsuarioLogin = {
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
    throw new ValidationError(MensagensErro.VALIDACAO.NOME);

  if (!email || email.trim() === "")
    throw new ValidationError(MensagensErro.VALIDACAO.EMAIL);

  if (!senha || senha.trim() === "")
    throw new ValidationError(MensagensErro.VALIDACAO.SENHA);
};

export const validarCamposLogin = ({ email, senha }: UsuarioLogin) => {
  if (!email || email.trim() === "")
    throw new ValidationError(MensagensErro.AUTH.CREDENCIAIS_INVALIDAS);

  if (!senha || senha.trim() === "")
    throw new ValidationError(MensagensErro.AUTH.CREDENCIAIS_INVALIDAS);
};
