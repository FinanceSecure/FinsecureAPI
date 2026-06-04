import { ErroMessages } from "@domain/erros/validation.js";
import { ValidationError } from "../errors/ApplicationError.js";

type UserLogin = {
  email?: string;
  password?: string;
};

type UserRegistered = {
  name: string;
  email: string;
  password: string;
};

export function validatePassword(password: string) {
  if (password.length < 12)
    throw new ValidationError("A senha deve conter no minimo 12 caracteres.");

  if (password.length > 128)
    throw new ValidationError("A senha deve conter no maximo 128 caracteres.");
}

export const checkRegistrationFields = ({
  name,
  email,
  password,
}: UserRegistered) => {
  if (!name || name.trim() === "")
    throw new ValidationError(ErroMessages.VALIDACAO.NOME);

  if (!email || email.trim() === "")
    throw new ValidationError(ErroMessages.VALIDACAO.EMAIL);

  if (!password || password.trim() === "")
    throw new ValidationError(ErroMessages.VALIDACAO.SENHA);

  validatePassword(password);
};

export const checkLoginFields = ({ email, password }: UserLogin) => {
  if (!email || email.trim() === "")
    throw new ValidationError(ErroMessages.AUTH.CREDENCIAIS_INVALIDAS);

  if (!password || password.trim() === "")
    throw new ValidationError(ErroMessages.AUTH.CREDENCIAIS_INVALIDAS);
};
