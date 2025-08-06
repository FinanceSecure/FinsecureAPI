import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const CDI_DIARIO = parseFloat(process.env.CDI_DIARIO || "0.000459")

  const tipos = [
    {
      nome: "LCI (100% do CDI) - Isento IR",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO,
      impostoRenda: false
    },
    {
      nome: "Saldo - Mercado Pago (100% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO,
      impostoRenda: true
    },
    {
      nome: "Saldo - Mercado Pago (105% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.05,
      impostoRenda: true
    },
    {
      nome: "Saldo - Mercado Pago (107% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.07,
      impostoRenda: true
    },
    {
      nome: "Cofrinho - Mercado Pago (115% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.15,
      impostoRenda: true
    },
    {
      nome: "Cofrinho - Mercado Pago Meli+",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.20,
      impostoRenda: true
    },
    {
      nome: "CDB Banco Inter (110% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.10,
      impostoRenda: true
    },
    {
      nome: "CDB Nubank (112% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.12,
      impostoRenda: true
    },
    {
      nome: "CDB PicPay (120% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.20,
      impostoRenda: true
    },
    {
      nome: "LCA Banco do Brasil (98% do CDI) - Isento IR",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 0.98,
      impostoRenda: false
    },
    {
      nome: "Tesouro Selic 2029",
      tipo: "SELIC",
      valorPercentual: CDI_DIARIO,
      impostoRenda: true
    }
  ];

  for (const tipo of tipos) {
    await prisma.tipoInvestimento.upsert({
      where: { nome: tipo.nome },
      update: {},
      create: tipo
    });
  }

  console.log("✔️ Seed concluído!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
