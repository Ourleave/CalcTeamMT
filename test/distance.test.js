import { estimateFiberDistance } from "../js/calculators/distance.js";

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

const result = estimateFiberDistance({
  fiberLoss: 1.4,
  attenuationPerKm: 0.35
});

assertEqual(result.kilometers, 4, "Estimasi kilometer tidak sesuai");
assertEqual(result.meters, 4000, "Estimasi meter tidak sesuai");

console.log("distance.test.js: PASS");


