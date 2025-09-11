import prisma from "@/adapters/database/db";

export async function visualizarRendaFixa(usuarioId: string) {
    return prisma.rendaFixa.findUnique({ where: { usuarioId } });
};

export async function visualizarRendaVariavel(usuarioId: string) {
    const rendaVariavel = await prisma.rendaVariavel.findUnique({
        where: { usuarioId },
    });
    console.log("Funcionou: ", rendaVariavel?.valor);
    return { vendas: rendaVariavel?.valor };
}
