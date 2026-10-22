import { getSplitterById } from "../data/splitters.js";
import { nonNegative, wholeNumber } from "../validation.js";

export const DEFAULT_SPLICE_LOSS = 0.1;
export const DEFAULT_FIBER_LOSS = 0.35;

export function calculateSplitterOutput({
  inputPower = 0,
  splitterId = "1:8",
  spliceCount = 0,
  fiberLength = 0,
  connectorLoss = 0,
  otherLoss = 0,
  spliceLossPerPoint = DEFAULT_SPLICE_LOSS,
  fiberLossPerKm = DEFAULT_FIBER_LOSS
} = {}) {
  const splitter = getSplitterById(splitterId);

  const safeInput = Number(inputPower) || 0;
  const safeSpliceCount = wholeNumber(spliceCount);
  const safeFiberLength = nonNegative(fiberLength);
  const safeConnectorLoss = nonNegative(connectorLoss);
  const safeOtherLoss = nonNegative(otherLoss);

  const losses = {
    splitter: splitter.loss,
    splice: safeSpliceCount * nonNegative(spliceLossPerPoint, DEFAULT_SPLICE_LOSS),
    fiber: safeFiberLength * nonNegative(fiberLossPerKm, DEFAULT_FIBER_LOSS),
    connector: safeConnectorLoss,
    other: safeOtherLoss
  };

  const totalLoss = Object.values(losses).reduce((sum, value) => sum + value, 0);
  const outputPower = safeInput - totalLoss;

  return {
    inputPower: safeInput,
    outputPower,
    totalLoss,
    splitter,
    spliceCount: safeSpliceCount,
    fiberLength: safeFiberLength,
    losses
  };
}

export function calculatePortOutputs(inputPower, splitterId) {
  const splitter = getSplitterById(splitterId);
  const outputPower = (Number(inputPower) || 0) - splitter.loss;

  return Array.from(
    { length: splitter.ports },
    (_, index) => ({
      port: index + 1,
      loss: splitter.loss,
      outputPower
    })
  );
}


