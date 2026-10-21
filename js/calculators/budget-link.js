import { nonNegative, wholeNumber } from "../validation.js";

export function calculateBudgetLink({
  txPower = 4,
  fiberLength = 0,
  fiberLossPerKm = 0.35,
  splitterLosses = [],
  spliceCount = 0,
  spliceLossPerPoint = 0.1,
  connectorLoss = 0.5,
  safetyMargin = 1.5
} = {}) {
  const safeTxPower = Number(txPower) || 0;
  const safeFiberLength = nonNegative(fiberLength);
  const safeSpliceCount = wholeNumber(spliceCount);

  const fiberLoss = safeFiberLength * nonNegative(fiberLossPerKm, 0.35);
  const splitterLoss = splitterLosses.reduce(
    (total, loss) => total + nonNegative(loss),
    0
  );
  const spliceLoss = safeSpliceCount * nonNegative(spliceLossPerPoint, 0.1);
  const safeConnectorLoss = nonNegative(connectorLoss);
  const safeSafetyMargin = nonNegative(safetyMargin);

  const totalLoss =
    fiberLoss +
    splitterLoss +
    spliceLoss +
    safeConnectorLoss +
    safeSafetyMargin;

  return {
    txPower: safeTxPower,
    rxPower: safeTxPower - totalLoss,
    totalLoss,
    losses: {
      fiber: fiberLoss,
      splitter: splitterLoss,
      splice: spliceLoss,
      connector: safeConnectorLoss,
      safetyMargin: safeSafetyMargin
    }
  };
}


