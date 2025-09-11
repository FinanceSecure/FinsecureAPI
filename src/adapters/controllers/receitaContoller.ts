import { AuthRequest } from "@/domain/middlewares/authMiddleware";
import { NotFoundError } from "@/infraestructure/utils/HttpError";
import { Response } from "express";
import * as receitaService from "@/domain/services/verificarReceitas";

export async function Receitas(req: AuthRequest, res: Response) {
	const usuarioId = req.user?.usuarioId;
	if (!usuarioId) return NotFoundError;

	const receitas = await receitaService.verificarReceitas(usuarioId);
	return res.status(200).json(receitas);
}

export async function ReceitaRendaFixa(req: AuthRequest, res: Response) {
	const usuarioId = req.user?.usuarioId;
	if (!usuarioId) return NotFoundError;

	const rendaFixa = await receitaService.verificarRendaFixa(usuarioId);
	return res.status(200).json(rendaFixa);
}

export async function ReceitaVariavel(req: AuthRequest, res: Response) {
	const usuarioId = req.user?.usuarioId;
	if (!usuarioId) return NotFoundError;

	const rendaVariavel = await receitaService.verificarTotalRendaVariavel(usuarioId);
	return res.status(200).json(rendaVariavel);
}
