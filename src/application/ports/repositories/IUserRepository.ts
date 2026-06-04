import { User } from "@domain/entities";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  updateEmail(userId: string, newEmail: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  deleteById(userId: string): Promise<void>;
}
