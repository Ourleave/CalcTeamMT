import { getSignalStatus } from "../js/data/ont-profiles.js";

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

assertEqual(getSignalStatus(-5).key, "bad", "-5 dBm harus terlalu kuat");
assertEqual(getSignalStatus(-18.7).key, "normal", "-18.7 dBm harus normal");
assertEqual(getSignalStatus(-25).key, "warning", "-25 dBm harus waspada");
assertEqual(getSignalStatus(-30).key, "bad", "-30 dBm harus LOS");
assertEqual(typeof getSignalStatus(-18.7).shortLabel, "string", "shortLabel wajib ada");
assertEqual(typeof getSignalStatus(-18.7).recommendation, "string", "recommendation wajib ada");

console.log("status.test.js: PASS");
