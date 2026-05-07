import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "@/domain/entities";
import { ErroMessages } from "@domain/erros";

import { IUserRepository } from "../ports/repositories";
import { checkRegistrationFields, checkLoginFields } from "../validators";

import {
  AuthenticationError,
  ConflictError,
  ResourceNotFoundError,
  ValidationError
} from "../errors";

import { env } from "@shared/config";

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

      const existingUser =
        await userRepository.findByEmail(email);

      if (existingUser)
        throw new ConflictError(
          ErroMessages.USUARIO.JA_CADASTRADO
        );

      const passwordHash =
        await bcrypt.hash(password, 10);

      const user = new User(
        null,
        name,
        email,
        passwordHash
      );

      return userRepository.save(user);
    },

    async login(
      email: string,
      password: string
    ) {
      checkLoginFields({
        email,
        password,
      });

      const user =
        await userRepository.findByEmail(email);

      if (!user)
        throw new AuthenticationError(
          ErroMessages.AUTH.CREDENCIAIS_INVALIDAS
        );

      const validPassword =
        await bcrypt.compare(password, user.password);

      if (!validPassword)
        throw new AuthenticationError(
          ErroMessages.AUTH.CREDENCIAIS_INVALIDAS
        );

      const token = jwt.sign(
        {
          userId: user.id,
          name: user.name,
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
        throw new ResourceNotFoundError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );

      const user =
        await userRepository.findById(userId);

      if (!user)
        throw new ResourceNotFoundError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );

      await userRepository.deleteById(userId);

      return {
        message: "Usuário removido com sucesso.",
      };
    },

    async changeEmail(
      oldEmail: string,
      newEmail: string
    ) {
      if (!oldEmail || !newEmail)
        throw new ValidationError(
          ErroMessages.VALIDACAO.EMAIL
        );

      const user =
        await userRepository.findByEmail(oldEmail);

      if (!user)
        throw new ResourceNotFoundError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );

      const existingEmail =
        await userRepository.findByEmail(newEmail);

      if (existingEmail)
        throw new ConflictError(
          ErroMessages.USUARIO.JA_CADASTRADO
        );

      await userRepository.updateEmail(
        oldEmail,
        newEmail
      );

      return {
        message: "E-mail alterado com sucesso.",
      };
    },

    async changePassword(
      email: string,
      oldPassword: string,
      newPassword: string
    ) {
      if (!email)
        throw new ValidationError(
          ErroMessages.VALIDACAO.EMAIL
        );

      if (!oldPassword)
        throw new ValidationError(
          ErroMessages.VALIDACAO.SENHA_ANTIGA
        );

      if (!newPassword)
        throw new ValidationError(
          ErroMessages.VALIDACAO.SENHA_NOVA
        );

      const user =
        await userRepository.findByEmail(email);

      if (!user)
        throw new ResourceNotFoundError(
          ErroMessages.USUARIO.NAO_ENCONTRADO
        );

      const validPassword =
        await bcrypt.compare(
          oldPassword,
          user.password
        );

      if (!validPassword)
        throw new ValidationError(
          ErroMessages.USUARIO.SENHA_ANTIGA_INCORRETA
        );

      const passwordHash =
        await bcrypt.hash(newPassword, 10);

      await userRepository.updatePassword(
        email,
        passwordHash
      );

      return {
        message: "Senha alterada com sucesso.",
      };
    },
  };
}
