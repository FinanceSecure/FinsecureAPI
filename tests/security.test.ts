import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";
import Fastify from "fastify";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { User } from "../src/domain/entities/User.js";
import type { IUserRepository } from "../src/application/ports/repositories/IUserRepository.js";
import type { ITransactionRepository } from "../src/application/ports/repositories/ITransactionRepository.js";
import type { IInvestmentRepository } from "../src/application/ports/repositories/IInvestmentRepository.js";

process.env.DATABASE_URL ??= "mongodb://localhost:27017/financesecure-test";
process.env.JWT_SECRET ??= "test-secret-with-at-least-32-characters";

class InMemoryUserRepository implements IUserRepository {
  users = new Map<string, User>();

  async findByEmail(email: string) {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }

  async save(user: User) {
    const savedUser = new User("user-1", user.name, user.email, user.password);
    this.users.set(savedUser.id!, savedUser);
    return savedUser;
  }

  async updateEmail(userId: string, newEmail: string) {
    const user = this.users.get(userId);
    if (user) user.email = newEmail;
  }

  async updatePassword(userId: string, passwordHash: string) {
    const user = this.users.get(userId);
    if (user) user.password = passwordHash;
  }

  async deleteById(userId: string) {
    this.users.delete(userId);
  }
}

test("registration stores argon2id and never returns the password hash", async () => {
  const { createUserUseCases } = await import(
    "../src/application/use-cases/userUseCases.js"
  );
  const repository = new InMemoryUserRepository();
  const useCases = createUserUseCases({ userRepository: repository });

  const response = await useCases.register(
    "Arthur",
    "ARTHUR@example.com",
    "uma passphrase longa e segura"
  );

  assert.deepEqual(response, {
    id: "user-1",
    name: "Arthur",
    email: "arthur@example.com",
  });
  assert.match(repository.users.get("user-1")!.password, /^\$argon2id\$/);
});

test("legacy bcrypt hashes are upgraded after a valid login", async () => {
  const { createUserUseCases } = await import(
    "../src/application/use-cases/userUseCases.js"
  );
  const repository = new InMemoryUserRepository();
  repository.users.set(
    "legacy-user",
    new User(
      "legacy-user",
      "Legacy",
      "legacy@example.com",
      await bcrypt.hash("senha antiga segura", 10)
    )
  );
  const useCases = createUserUseCases({ userRepository: repository });

  await useCases.login("legacy@example.com", "senha antiga segura");

  assert.match(repository.users.get("legacy-user")!.password, /^\$argon2id\$/);
});

test("email changes use the authenticated user id", async () => {
  const { createUserUseCases } = await import(
    "../src/application/use-cases/userUseCases.js"
  );
  const repository = new InMemoryUserRepository();
  repository.users.set(
    "user-1",
    new User("user-1", "Arthur", "old@example.com", "hash")
  );
  const useCases = createUserUseCases({ userRepository: repository });

  await useCases.changeEmail("user-1", "NEW@example.com");

  assert.equal(repository.users.get("user-1")!.email, "new@example.com");
});

test("login failures do not reveal whether the account exists", async () => {
  const { createUserUseCases } = await import(
    "../src/application/use-cases/userUseCases.js"
  );
  const repository = new InMemoryUserRepository();
  const useCases = createUserUseCases({ userRepository: repository });

  await assert.rejects(
    () => useCases.login("missing@example.com", "senha incorreta"),
    { message: "E-mail ou senha incorretos." }
  );
});

test("JWT middleware rejects invalid tokens and accepts valid tokens", async () => {
  const { autenticarTokenFastify } = await import(
    "../src/adapters/http/middlewares/authMiddleware.js"
  );
  const app = Fastify();

  app.get("/private", { preHandler: autenticarTokenFastify }, async (request) => ({
    userId: request.user?.userId,
  }));

  const missing = await app.inject({ method: "GET", url: "/private" });
  assert.equal(missing.statusCode, 401);

  const invalid = await app.inject({
    method: "GET",
    url: "/private",
    headers: { authorization: "Bearer invalid" },
  });
  assert.equal(invalid.statusCode, 401);

  const token = jwt.sign({ userId: "user-1" }, process.env.JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: "2h",
  });
  const valid = await app.inject({
    method: "GET",
    url: "/private",
    headers: { authorization: `Bearer ${token}` },
  });

  assert.equal(valid.statusCode, 200);
  assert.deepEqual(valid.json(), { userId: "user-1" });
  await app.close();
});

test("admin middleware rejects common users and accepts administrators", async () => {
  const { requireAdminFastify } = await import(
    "../src/adapters/http/middlewares/adminMiddleware.js"
  );
  const app = Fastify();

  app.get("/admin", { preHandler: requireAdminFastify }, async () => ({
    ok: true,
  }));

  app.addHook("onRequest", async (request) => {
    request.user = {
      userId: "user-1",
      role:
        request.headers["x-test-role"] === "ADMIN"
          ? UserRole.ADMIN
          : UserRole.USER,
    };
  });

  const commonUser = await app.inject({ method: "GET", url: "/admin" });
  assert.equal(commonUser.statusCode, 403);

  const admin = await app.inject({
    method: "GET",
    url: "/admin",
    headers: { "x-test-role": "ADMIN" },
  });
  assert.equal(admin.statusCode, 200);

  await app.close();
});

test("HTTP app exposes health check and protects private routes", async () => {
  const { default: app } = await import("../src/app.js");

  const health = await app.inject({ method: "GET", url: "/health" });
  assert.equal(health.statusCode, 200);
  assert.deepEqual(health.json(), {
    status: "ok",
    service: "financesecure-api",
  });

  const privateRoute = await app.inject({
    method: "GET",
    url: "/api/investimento/tipo",
  });
  assert.equal(privateRoute.statusCode, 401);

  await app.close();
});

test("login endpoint rate limits repeated invalid payloads", async () => {
  const { default: app } = await import("../src/app.js?rate-limit-test");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await app.inject({
      method: "POST",
      url: "/api/usuarios/login",
      payload: {},
    });

    assert.equal(response.statusCode, 400);
  }

  const blocked = await app.inject({
    method: "POST",
    url: "/api/usuarios/login",
    payload: {},
  });
  assert.equal(blocked.statusCode, 429);

  await app.close();
});

test("common users cannot create investment types through the HTTP API", async () => {
  const { default: app } = await import("../src/app.js?admin-route-test");
  const token = jwt.sign(
    {
      userId: "user-1",
      role: UserRole.USER,
    },
    process.env.JWT_SECRET!,
    {
      algorithm: "HS256",
      expiresIn: "2h",
    }
  );

  const response = await app.inject({
    method: "POST",
    url: "/api/investimento/tipo/adicionar",
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      name: "CDB",
      type: "FIXED_INCOME",
      benchmarkPercentage: 100,
      hasIncomeTax: true,
    },
  });

  assert.equal(response.statusCode, 403);
  await app.close();
});

test("user A cannot update user B transactions", async () => {
  const { createTransactionUseCases } = await import(
    "../src/application/use-cases/transactionUseCases.js"
  );
  let updateCalled = false;
  const transactionRepository = {
    async create() {
      throw new Error("not used");
    },
    async findByIdAndUserId() {
      return null;
    },
    async findByUserId() {
      return [];
    },
    async update() {
      updateCalled = true;
      throw new Error("should not update");
    },
    async getTotalCompletedByUser() {
      return 0;
    },
    async listPendingUntil() {
      return [];
    },
    async remove() {
      throw new Error("not used");
    },
    async updateStatus() {},
  } as unknown as ITransactionRepository;
  const useCases = createTransactionUseCases({
    transactionRepository,
    investmentRepository: {} as IInvestmentRepository,
    recalculateBalance: async () => 0,
  });

  await assert.rejects(
    () => useCases.updateTransaction("transaction-b", "user-a", undefined, undefined, 100),
    { message: "Transação não encontrada." }
  );
  assert.equal(updateCalled, false);
});

test("transactions reject invalid update amounts", async () => {
  const { createTransactionUseCases } = await import(
    "../src/application/use-cases/transactionUseCases.js"
  );
  const transactionRepository = {
    async create() {
      throw new Error("not used");
    },
    async findByIdAndUserId() {
      throw new Error("should validate before repository lookup");
    },
    async findByUserId() {
      return [];
    },
    async update() {
      throw new Error("not used");
    },
    async getTotalCompletedByUser() {
      return 0;
    },
    async listPendingUntil() {
      return [];
    },
    async remove() {
      throw new Error("not used");
    },
    async updateStatus() {},
  } as unknown as ITransactionRepository;
  const useCases = createTransactionUseCases({
    transactionRepository,
    investmentRepository: {} as IInvestmentRepository,
    recalculateBalance: async () => 0,
  });

  await assert.rejects(
    () => useCases.updateTransaction("transaction-1", "user-1", undefined, undefined, 0),
    { message: "O valor da transação deve ser maior que zero" }
  );
});

test("investments reject redemption above available balance", async () => {
  const { createInvestmentUseCases } = await import(
    "../src/application/use-cases/investmentUseCases.js"
  );
  let redemptionCalled = false;
  const investmentRepository = {
    async findInvestmentsWithApplications() {
      return [
        {
          id: "investment-1",
          investmentTypeId: "type-1",
          totalApplied: 100,
          totalRedeemed: 0,
          currentBalance: 100,
          lastYieldAt: null,
          isRedeemed: false,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          applications: [
            {
              id: "application-1",
              type: "APPLICATION",
              amount: 100,
              date: new Date("2026-01-01T00:00:00.000Z"),
            },
          ],
          yields: [],
          investmentType: {
            id: "type-1",
            name: "CDB",
            benchmarkPercentage: 100,
            hasIncomeTax: true,
          },
        },
      ];
    },
    async createRedemptionApplication() {
      redemptionCalled = true;
      throw new Error("should not redeem");
    },
  } as unknown as IInvestmentRepository;
  const useCases = createInvestmentUseCases({ investmentRepository });

  await assert.rejects(
    () => useCases.redeemInvestment("user-1", "investment-1", 101),
    { message: "Valor de resgate maior que o disponivel." }
  );
  assert.equal(redemptionCalled, false);
});
