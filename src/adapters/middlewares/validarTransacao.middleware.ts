import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../utils";

export function validarTransacaoMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { descricao, valor, data, tipo } = req.body;
    const usuarioId = req.user?.usuarioId;
    const parsedDate = new Date(data);
    const tiposValidos = ["entrada", "saida"]

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
      throw new HttpError("Tipo deve ser informado como 'entrada' ou 'saida'");
    }

    if (descricao.length > 255) {
      throw new HttpError("Descrição mito longa inforamda, o máximo é de 255 caracteres", 422)
    }

    if (tipo === 'entrada' && valor <= 0) {
      throw new HttpError("O valor da entrada deve ser superior a 0", 422)
    }

    if (tipo === 'saida' && valor >= 0) {
      throw new HttpError("O valor da saida deve ser inferior a 0", 422)
    }

    const agora = new Date();
    const status = parsedDate > agora ? "pendente" : "efetivada";

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
