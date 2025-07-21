import { Request, Response } from "express";
import prisma from "../../db";

export async function acrescentartipoInvestimento(req: Request, res: Response) {

  const {
    nome,
    tipo,
    valorPercentual
  } = req.body;

  const tipoInvestimento = await prisma.tipoInvestimento.create({
    data: {
      nome,
      tipo,
      valorPercentual
    }
  });

  res.status(201).json(tipoInvestimento);
}

export async function visualizarTipoInvestimento(id: number) {
  const tipoInvestimento = await prisma.tipoInvestimento.findFirst({
    where: { id }
  })

  return tipoInvestimento
}
