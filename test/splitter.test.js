import { calculateSplitterOutput } from "../js/calculators/splitter.js";

function assertEqual(actual, expected, message) {
  if (Math.abs(actual - expected) > 0.0001) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

const result = calculateSplitterOutput({
  inputPower: -10,
  splitterId: "1:16",
  spliceCount: 1,
  fiberLength: 0,
  connectorLoss: 0,
  otherLoss: 0
});

assertEqual(result.outputPower, -23.9, "Output splitter 1:16 tidak sesuai");
assertEqual(result.totalLoss, 13.9, "Total loss splitter tidak sesuai");

console.log("splitter.test.js: PASS");


