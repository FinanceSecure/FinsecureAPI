import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function adicionarTransacao(req: Request, res: Response) {
  try {
    const { descricao, valor, data } = req.body;
    const usuarioId = req.user?.usuarioId;

    if (!descricao || !valor || !data || !usuarioId)
      return res.status(400).json({ error: "Dados incompletos" });

    if (typeof descricao !== 'string' || typeof valor !== 'number')
      return res.status(400).json({ error: "Dados inválidos" });

    if (descricao.length > 255)
      return res.status(400).json({ error: "Descrição muito longa" });

    const parsedDate = new Date(data);
    if (isNaN(parsedDate.getTime()))
      return res.status(400).json({ error: "Data inválida" });

    if (parsedDate > new Date())
      return res.status(400).json({ error: "Data não pode ser no futuro" });

    const { tipo } = req.body;
    if (!tipo || typeof tipo !== 'string')
      return res.status(400).json({ error: "Tipo é obrigatório e deve ser uma string" });

    const tiposValidos = ['entrada', 'saida'];
    if (!tiposValidos.includes(tipo))
      return res.status(400).json({ error: "Tipo inválido, deve ser 'entrada' ou 'saida'" });

    tipo === 'saida' && valor > 0
      ? res.status(400).json({ error: "Valor de saída deve ser negativo" })
      : tipo === 'entrada' && valor < 0
        ? res.status(400).json({ error: "Valor de entrada deve ser positivo" })
        : null;

    const transacao = await prisma.transacao.create({
      data: {
        descricao,
        valor,
        data: parsedDate,
        usuario_id: usuarioId,
        tipo
      }
    });

    const saldoTotal = await prisma.transacao.aggregate({
      _sum: {
        valor: true
      },
      where: {
        usuario_id: usuarioId
      }
    });

    const saldoAtualizado = saldoTotal._sum.valor || 0;

    const saldoExistente = await prisma.saldo.findFirst({
      where: { usuario_id: usuarioId },
    });

    if (saldoExistente) {
      await prisma.saldo.update({
        where: { id: saldoExistente.id },
        data: { valor: saldoAtualizado }
      });
    } else {
      await prisma.saldo.create({
        data: {
          usuario_id: usuarioId,
          valor: saldoAtualizado
        }
      });
    }
    res.status(201).json(transacao);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno do servidor" })
  }
}
