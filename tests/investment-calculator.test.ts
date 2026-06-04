import assert from "node:assert/strict";
import test from "node:test";
import { InvestmentCalculatorService } from "../src/domain/services/investment-calculator.js";

test("investment principal balance follows the ledger", () => {
  const balance = InvestmentCalculatorService.calculatePrincipalBalance([
    { type: "APPLICATION", amount: 1000 },
    { type: "APPLICATION", amount: 500 },
    { type: "REDEMPTION", amount: 325 },
    { type: "INTEREST", amount: 99 },
  ]);

  assert.equal(balance, 1175);
});
