import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "@domain/entities";
import { MensagensErro } from "@domain/erros/validation.js";
import { ISaldoRepository, IUsuarioRepository } from "../ports/repositories";
import { validarCamposCadastro, validarCamposLogin } from "@application/validators";
import {
  AuthenticationError,
  ConflictError,
  ResourceNotFoundError,
  ValidationError
} from "@application/errors";
import { env } from "@/shared/config";

export function criarUsuarioUseCases(
  deps: {
    usuarioRepository: IUsuarioRepository;
    saldoRepository: ISaldoRepository;
  }
) {
  const { usuarioRepository, saldoRepository } = deps;

  return {
    async cadastrar(
      nome: string,
      email: string,
      senha: string
    ) {
      validarCamposCadastro({ nome, email, senha });

      const usuarioExistente = await usuarioRepository.encontrarPorEmail(email);

      if (usuarioExistente)
        throw new ConflictError(MensagensErro.USUARIO.JA_CADASTRADO);

      const senhaHash = await bcrypt.hash(senha, 10);
      const usuario = new Usuario(
        null,
        nome,
        email,
        senhaHash
      );

      const usuarioSalvo = await usuarioRepository.salvar(usuario);

      if (usuarioSalvo.id)
        await saldoRepository.criarSaldo(usuarioSalvo.id, 0);

      return usuarioSalvo;
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
