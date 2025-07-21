import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../utils";

export function validarTransacaoMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { descricao, valor, data, tipo } = req.body;
    const usuarioId = req.user?.usuarioId;
    const parsedDate = new Date(data);
    const tiposValidos = ["ENTRADA", "SAIDA"]

    if (!usuarioId) {
      throw new HttpError("Usuário não autenticado", 401);
    }

    if (!descricao || valor === undefined || !data || !tipo) {
      throw new HttpError("Dados incompletos ou invalidos", 400)
    }

    if (typeof descricao !== 'string' || typeof valor !== 'number' || typeof tipo !== 'string') {
      throw new HttpError("Formato de dados inválidos", 422);
    }

    if (isNaN(parsedDate.getTime())) {
      throw new HttpError("Data inválida", 422);
    }

    if (!tiposValidos.includes(tipo)) {
      throw new HttpError("Tipo deve ser informado como 'ENTRADA' ou 'SAIDA'");
    }

    if (descricao.length > 255) {
      throw new HttpError("Descrição mito longa inforamda, o máximo é de 255 caracteres", 422)
    }

    if (tipo === 'ENTRADA' && valor <= 0) {
      throw new HttpError("O valor da ENTRADA deve ser superior a 0", 422)
    }

    if (tipo === 'saida' && valor >= 0) {
      throw new HttpError("O valor da SAIDA deve ser inferior a 0", 422)
    }

    const agora = new Date();
    const status = parsedDate > agora ? "PENDENTE" : "EFETIVADA";

    req.body.validated = {
      descricao,
      valor,
      data: parsedDate,
      tipo,
      usuarioId,
      status
    };

    next();
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
