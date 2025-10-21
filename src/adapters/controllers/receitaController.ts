import { AuthRequest } from "../http/middlewares/authMiddleware";
import { NotFoundError } from "@/infraestructure/utils/HttpError";
import { Response } from "express";
import * as ReceitaService from "@/domain/services/receitaService";

export async function Receitas(req: AuthRequest, res: Response) {
	const usuarioId = req.user?.usuarioId;
	if (!usuarioId) return NotFoundError;

	const receitas = await ReceitaService.verificarReceitas(usuarioId);
	return res.status(200).json(receitas);
}

export async function ReceitaRendaFixa(req: AuthRequest, res: Response) {
	const usuarioId = req.user?.usuarioId;
	if (!usuarioId) return NotFoundError;

	const rendaFixa = await ReceitaService.verificarRendaFixa(usuarioId);
	return res.status(200).json(rendaFixa);
}

export async function ReceitaVariavel(req: AuthRequest, res: Response) {
	const usuarioId = req.user?.usuarioId;
	if (!usuarioId) return NotFoundError;

	const rendaVariavel = await ReceitaService.verificarTotalRendaVariavel(usuarioId);
	return res.status(200).json(rendaVariavel);
}
