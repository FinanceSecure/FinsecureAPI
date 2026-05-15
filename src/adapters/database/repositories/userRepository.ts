import { User } from "@/domain/entities";
import { IUserRepository } from "@application/ports/repositories";
import prisma from "../db.js";

export class UserRepository implements IUserRepository {

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    return new User(
      user.id,
      user.name,
      user.email,
      user.password
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    return new User(
      user.id,
      user.name,
      user.email,
      user.password
    );
  }

  async save(user: User): Promise<User> {
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    return new User(
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.password
    );
  }

  async updateEmail(oldEmail: string, newEmail: string): Promise<void> {
    await prisma.user.update({
      where: { email: oldEmail },
      data: { email: newEmail },
    });
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { email },
      data: { password: passwordHash },
    });
  }

  async deleteById(userId: string): Promise<void> {
    const investments = await prisma.investment.findMany({
      where: { userId },
      select: { id: true },
    });
    const investmentIds = investments.map((investment) => investment.id);

    await prisma.investmentYieldHistory.deleteMany({
      where: { investmentId: { in: investmentIds } },
    });
    await prisma.investmentApplication.deleteMany({
      where: { investmentId: { in: investmentIds } },
    });
    await prisma.transaction.deleteMany({
      where: { userId },
    });
    await prisma.investment.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({ where: { id: userId } });
  }
}
