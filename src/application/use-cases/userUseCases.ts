import jwt from "jsonwebtoken";
import { User } from "@/domain/entities";
import { ErroMessages } from "@domain/erros";
import { IUserRepository } from "../ports/repositories";
import {
  checkRegistrationFields,
  checkLoginFields,
  validatePassword,
} from "../validators";
import {
  AuthenticationError,
  ConflictError,
  ResourceNotFoundError,
  ValidationError
} from "../errors";
import { env } from "@shared/config";
import {
  hashPassword,
  needsPasswordRehash,
  verifyPassword,
} from "@shared/security/password";

type UserUseCasesDeps = {
  userRepository: IUserRepository;
};

export function createUserUseCases({
  userRepository,
}: UserUseCasesDeps) {
  if (!userRepository)
    throw new Error("UserRepository é obrigatório");

  return {
    async register(
      name: string,
      email: string,
      password: string
    ) {
      checkRegistrationFields({
        name,
        email,
        password,
      });

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await userRepository.findByEmail(normalizedEmail);
      if (existingUser)
        throw new ConflictError(ErroMessages.USUARIO.JA_CADASTRADO);

      const passwordHash = await hashPassword(password);
      const user = new User(
        null,
        name.trim(),
        normalizedEmail,
        passwordHash
      );

      const savedUser = await userRepository.save(user);

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      };
    },

    async login(
      email: string,
      password: string
    ) {
      checkLoginFields({
        email,
        password,
      });

      const normalizedEmail = email.trim().toLowerCase();
      const user = await userRepository.findByEmail(normalizedEmail);
      if (!user)
        throw new AuthenticationError(ErroMessages.AUTH.CREDENCIAIS_INVALIDAS);

      const validPassword = await verifyPassword(user.password, password);
      if (!validPassword)
        throw new AuthenticationError(ErroMessages.AUTH.CREDENCIAIS_INVALIDAS);

      if (needsPasswordRehash(user.password)) {
        await userRepository.updatePassword(user.id!, await hashPassword(password));
      }

      const token = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          role: user.role,
        },
        env.jwtSecret,
        {
          expiresIn: "2h",
        }
      );

      return {
        token,
        message: "Login realizado com sucesso.",
      };
    },

    async remove(userId: string) {
      if (!userId)
        throw new ResourceNotFoundError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      const user = await userRepository.findById(userId);
      if (!user)
        throw new ResourceNotFoundError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      await userRepository.deleteById(userId);

      return {
        message: "Usuário removido com sucesso.",
      };
    },

    async changeEmail(userId: string, newEmail: string) {
      if (!userId)
        throw new AuthenticationError(ErroMessages.AUTH.CREDENCIAIS_INVALIDAS);

      if (!newEmail)
        throw new ValidationError(ErroMessages.VALIDACAO.EMAIL);

      const normalizedEmail = newEmail.trim().toLowerCase();
      const user = await userRepository.findById(userId);
      if (!user)
        throw new ResourceNotFoundError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      const existingEmail = await userRepository.findByEmail(normalizedEmail);
      if (existingEmail)
        throw new ConflictError(ErroMessages.USUARIO.JA_CADASTRADO);

      await userRepository.updateEmail(
        userId,
        normalizedEmail
      );

      return {
        message: "E-mail alterado com sucesso.",
      };
    },

    async changePassword(
      userId: string,
      oldPassword: string,
      newPassword: string
    ) {
      if (!userId)
        throw new AuthenticationError(ErroMessages.AUTH.CREDENCIAIS_INVALIDAS);

      if (!oldPassword)
        throw new ValidationError(ErroMessages.VALIDACAO.SENHA_ANTIGA);

      if (!newPassword)
        throw new ValidationError(ErroMessages.VALIDACAO.SENHA_NOVA);

      validatePassword(newPassword);

      const user = await userRepository.findById(userId);

      if (!user)
        throw new ResourceNotFoundError(ErroMessages.USUARIO.NAO_ENCONTRADO);

      const validPassword =
        await verifyPassword(user.password, oldPassword);

      if (!validPassword)
        throw new ValidationError(ErroMessages.USUARIO.SENHA_ANTIGA_INCORRETA);

      const passwordHash = await hashPassword(newPassword);

      await userRepository.updatePassword(
        userId,
        passwordHash
      );

      return {
        message: "Senha alterada com sucesso.",
      };
    },
  };
}
