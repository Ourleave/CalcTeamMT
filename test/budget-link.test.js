import { calculateBudgetLink } from "../js/calculators/budget-link.js";

function assertClose(actual, expected, message) {
  if (Math.abs(actual - expected) > 0.0001) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

const result = calculateBudgetLink({
  txPower: 4,
  fiberLength: 5,
  fiberLossPerKm: 0.35,
  splitterLosses: [7.2, 13.8],
  spliceCount: 4,
  connectorLoss: 0.5,
  safetyMargin: 1.5
});

assertClose(result.totalLoss, 26.15, "Total budget loss tidak sesuai");
assertClose(result.rxPower, -22.15, "RX budget tidak sesuai");

console.log("budget-link.test.js: PASS");


