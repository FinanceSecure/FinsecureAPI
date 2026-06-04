import assert from "node:assert/strict";
import test from "node:test";
import { createInvestmentUseCases } from "../src/application/use-cases/investmentUseCases.js";
import type {
  IInvestmentRepository,
  InvestmentWithRelations,
} from "../src/application/ports/repositories/IInvestmentRepository.js";

const decimalMoneyInvestment: InvestmentWithRelations = {
  id: "investment-1",
  investmentTypeId: "type-1",
  totalApplied: 5029.96,
  totalRedeemed: 0,
  currentBalance: 5029.96,
  lastYieldAt: null,
  isRedeemed: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  applications: [
    {
      id: "application-1",
      type: "APPLICATION",
      amount: 5029.96,
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
};

test("investment statements expose monetary values as decimal BRL, not cents", async () => {
  const investmentRepository = {
    async findInvestmentsPendingYield() {
      return [];
    },
    async findInvestmentsWithApplications() {
      return [decimalMoneyInvestment];
    },
  } as unknown as IInvestmentRepository;
  const useCases = createInvestmentUseCases({ investmentRepository });

  const statement = await useCases.getInvestmentsByType("user-1", "type-1");

  assert.equal(statement.summary.totalApplied, 5029.96);
  assert.equal(statement.summary.grossBalance, 5029.96);
  assert.equal(statement.investments[0].totals.grossBalance, 5029.96);
  assert.equal(statement.investments[0].applications[0].amount, 5029.96);
});

test("investment redemption receives and returns decimal BRL without cent conversion", async () => {
  let redeemedAmount: number | null = null;
  const investmentRepository = {
    async findInvestmentsWithApplications() {
      return [decimalMoneyInvestment];
    },
    async createRedemptionApplication(
      _investmentId: string,
      _userId: string,
      amount: number
    ) {
      redeemedAmount = amount;
      return {};
    },
  } as unknown as IInvestmentRepository;
  const useCases = createInvestmentUseCases({ investmentRepository });

  const result = await useCases.redeemInvestment(
    "user-1",
    "investment-1",
    5029.96
  );

  assert.equal(redeemedAmount, 5029.96);
  assert.equal(result.requestedAmount, 5029.96);
  assert.equal(result.redeemedAmount, 5029.96);
  assert.equal(result.remainingBalance, 0);
});
