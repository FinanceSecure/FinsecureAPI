import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const CDI_DIARIO = 0.0005474; // (≈13,8% a.a.)

  const tipos = [
    {
      nome: "LCI (100% do CDI) - Isento IR",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.0,
      impostoRenda: false
    },
    {
      nome: "Saldo - Mercado Pago (100% do CDI)",
      tipo: "CDI",
      valorPercentual: CDI_DIARIO * 1.0,
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
      nome: "Cofrinho - Mercado Pago Meli+ (120% do CDI)",
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
      valorPercentual: 0.000549, // ~13.85% anual
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

  console.log("✔️ Tipos de investimentos cadastrados com êxito!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
