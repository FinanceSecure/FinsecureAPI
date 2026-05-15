import { PrismaClient, InvestmentCategory } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const tipos = [
    {
      name: "LCI (100% do CDI) - Isento de IR",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 100,
      hasIncomeTax: false,
    },
    {
      name: "Saldo - Mercado Pago (100% do CDI)",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 100,
      hasIncomeTax: true,
    },
    {
      name: "Saldo - Mercado Pago (105% do CDI)",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 105,
      hasIncomeTax: true,
    },
    {
      name: "Saldo - Mercado Pago (107% do CDI)",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 107,
      hasIncomeTax: true,
    },
    {
      name: "Cofrinho - Mercado Pago (115% do CDI)",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 115,
      hasIncomeTax: true,
    },
    {
      name: "Cofrinho Mercado Pago 120% do CDI",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 120,
      hasIncomeTax: false,
    },
    {
      name: "CDB Banco Inter (110% do CDI)",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 110,
      hasIncomeTax: true,
    },
    {
      name: "Caixinha Nubank 1 ano (112% do CDI)",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 112,
      hasIncomeTax: true,
    },
    {
      name: "Saldo PicPay (102% do CDI)",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 102,
      hasIncomeTax: true,
    },
    {
      name: "Banco do Brasil (98% do CDI) - Isento IR",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 98,
      hasIncomeTax: false,
    },
    {
      name: "Tesouro Selic 2029",
      type: InvestmentCategory.FIXED_INCOME,
      benchmarkPercentage: 100,
      hasIncomeTax: true,
    },
  ];

  for (const tipo of tipos) {
    await prisma.investmentType.upsert({
      where: { name: tipo.name },
      update: {},
      create: tipo,
    });
  }

  console.log("✔️ Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
