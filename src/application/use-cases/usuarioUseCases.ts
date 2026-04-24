import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Usuario } from "../../domain/entities/Usuario.js";
import { MensagensErro } from "../../domain/erros/validation.js";

import { IUsuarioRepository } from "../ports/repositories/IUsuarioRepository.js";

import {
  validarCamposCadastro,
  validarCamposLogin,
} from "../validators/usuarioValidator.js";

import {
  AuthenticationError,
  ConflictError,
  ResourceNotFoundError,
  ValidationError,
} from "../errors/ApplicationError.js";

import { env } from "@/shared/config/env.js";

export function criarUsuarioUseCases(
  usuarioRepository: IUsuarioRepository
) {
  return {
    async cadastrar(
      nome: string,
      email: string,
      senha: string
    ) {
      validarCamposCadastro({ nome, email, senha });

      const usuarioExistente =
        await usuarioRepository.encontrarPorEmail(email);

      if (usuarioExistente) {
        throw new ConflictError(
          MensagensErro.USUARIO.JA_CADASTRADO
        );
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = new Usuario(
        null,
        nome,
        email,
        senhaHash
      );

      return await usuarioRepository.salvar(usuario);
    },

    async logar(email: string, senha: string) {
      validarCamposLogin({ email, senha });

      const usuario =
        await usuarioRepository.encontrarPorEmail(email);

      if (!usuario) {
        throw new AuthenticationError(
          MensagensErro.AUTH.CREDENCIAIS_INVALIDAS
        );
      }

      const senhaValida = await bcrypt.compare(
        senha,
        usuario.senha
      );

      if (!senhaValida) {
        throw new AuthenticationError(
          MensagensErro.AUTH.CREDENCIAIS_INVALIDAS
        );
      }

      const token = jwt.sign(
        {
          usuarioId: usuario.id,
          nome: usuario.nome,
        },
        env.jwtSecret,
        {
          expiresIn: "2h",
        }
      );

      return {
        token,
        mensagem: "Login realizado com sucesso.",
      };
    },

    async remover(usuarioId: string) {
      if (!usuarioId) {
        throw new ResourceNotFoundError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      const usuario =
        await usuarioRepository.encontrarPorId(usuarioId);

      if (!usuario) {
        throw new ResourceNotFoundError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      await usuarioRepository.deletarPorId(usuarioId);

      return {
        mensagem: "Usuário removido com sucesso.",
      };
    },

    async alterarEmail(
      emailAntigo: string,
      emailNovo: string
    ) {
      if (!emailAntigo || !emailNovo) {
        throw new ValidationError(
          MensagensErro.VALIDACAO.EMAIL
        );
      }

      const usuario =
        await usuarioRepository.encontrarPorEmail(
          emailAntigo
        );

      if (!usuario) {
        throw new ResourceNotFoundError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      const emailJaExiste =
        await usuarioRepository.encontrarPorEmail(
          emailNovo
        );

      if (emailJaExiste) {
        throw new ConflictError(
          MensagensErro.USUARIO.JA_CADASTRADO
        );
      }

      await usuarioRepository.atualizarEmail(
        emailAntigo,
        emailNovo
      );

      return {
        mensagem: "E-mail alterado com sucesso.",
      };
    },

    async alterarSenha(
      email: string,
      senhaAntiga: string,
      senhaNova: string
    ) {
      if (!email) {
        throw new ValidationError(
          MensagensErro.VALIDACAO.EMAIL
        );
      }

      if (!senhaAntiga) {
        throw new ValidationError(
          MensagensErro.VALIDACAO.SENHA_ANTIGA
        );
      }

      if (!senhaNova) {
        throw new ValidationError(
          MensagensErro.VALIDACAO.SENHA_NOVA
        );
      }

      const usuario =
        await usuarioRepository.encontrarPorEmail(email);

      if (!usuario) {
        throw new ResourceNotFoundError(
          MensagensErro.USUARIO.NAO_ENCONTRADO
        );
      }

      const senhaValida = await bcrypt.compare(
        senhaAntiga,
        usuario.senha
      );

      if (!senhaValida) {
        throw new ValidationError(
          MensagensErro.USUARIO.SENHA_ANTIGA_INCORRETA
        );
      }

      const senhaHash = await bcrypt.hash(
        senhaNova,
        10
      );

      await usuarioRepository.atualizarSenha(
        email,
        senhaHash
      );

      return {
        mensagem: "Senha alterada com sucesso.",
      };
    },
  };
}
