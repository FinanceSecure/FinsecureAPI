import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tipos = [
    {
      "nome": "Saldo - Mercado Pago (100% do CDI)",
      "tipo": "CDI",
      "valorPercentual": 0.00076157,
      "impostoRenda": true
    },
    {
      "nome": "Saldo - Mercado Pago (105% do CDI)",
      "tipo": "CDI",
      "valorPercentual": 0.0077680,
      "impostoRenda": true
    },
    {
      "nome": "Saldo - Mercado Pago (107% do CDI)",
      "tipo": "CDI",
      "valorPercentual": 0.00081488,
      "impostoRenda": true
    },
    {
      "nome": "Cofrinho - Mercado Pago (115% do CDI)",
      "tipo": "CDI",
      "valorPercentual": 0.0008758055,
      "impostoRenda": true
    },
    {
      "nome": "Cofrinho - Mercado Pago Meli+ (120% do CDI)",
      "tipo": "CDI",
      "valorPercentual": 0.00091388,
      "impostoRenda": true
    },
    {
      "nome": "LCI (100% do CDI) - Isento IR",
      "tipo": "CDI",
      "valorPercentual": 0.00076157,
      "impostoRenda": false
    },
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
