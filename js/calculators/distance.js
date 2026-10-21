import { nonNegative } from "../validation.js";

export function estimateFiberDistance({
  fiberLoss = 0,
  attenuationPerKm = 0.35
} = {}) {
  const safeLoss = nonNegative(fiberLoss);
  const safeAttenuation = nonNegative(attenuationPerKm, 0.35);

  if (safeAttenuation === 0) {
    return {
      kilometers: 0,
      meters: 0
    };
  }

  const kilometers = safeLoss / safeAttenuation;

  return {
    kilometers,
    meters: Math.round(kilometers * 1000)
  };
}


