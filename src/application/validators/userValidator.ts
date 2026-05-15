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
  if (password.length < 8)
    throw new ValidationError("A senha deve conter no mínimo 8 caracteres.");

  if (!/(?=.*[A-Z])/.test(password))
    throw new ValidationError("A senha deve conter uma letra maiúscula.");

  if (!/(?=.*[\W_])/.test(password))
    throw new ValidationError("A senha deve conter um caractere especial.");
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
