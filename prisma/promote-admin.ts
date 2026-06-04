import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();
const emailArgument = process.argv.find((argument) => argument.startsWith("--email="));
const email = emailArgument?.slice("--email=".length).trim().toLowerCase();

if (!email) {
  throw new Error("Informe o e-mail com --email=usuario@exemplo.com");
}

try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: UserRole.ADMIN },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(`Usuario promovido: ${user.email} (${user.role})`);
} finally {
  await prisma.$disconnect();
}
