export const FIBER_COLORS = [
  { no: 1, name: "Biru", hex: "#2563eb" },
  { no: 2, name: "Oranye", hex: "#f97316" },
  { no: 3, name: "Hijau", hex: "#22c55e" },
  { no: 4, name: "Cokelat", hex: "#8b5a2b" },
  { no: 5, name: "Abu-abu", hex: "#94a3b8" },
  { no: 6, name: "Putih", hex: "#f8fafc" },
  { no: 7, name: "Merah", hex: "#ef4444" },
  { no: 8, name: "Hitam", hex: "#111827" },
  { no: 9, name: "Kuning", hex: "#eab308" },
  { no: 10, name: "Ungu", hex: "#8b5cf6" },
  { no: 11, name: "Pink", hex: "#ec4899" },
  { no: 12, name: "Toska", hex: "#06b6d4" }
];

export const WAVELENGTHS = [
  {
    name: "1310 nm",
    function: "Upstream GPON — ONT ke OLT",
    attenuation: "± 0.35 dB/km",
    rate: 0.35
  },
  {
    name: "1490 nm",
    function: "Downstream GPON — OLT ke ONT",
    attenuation: "± 0.22 dB/km",
    rate: 0.22
  },
  {
    name: "1550 nm",
    function: "Video Overlay / CATV",
    attenuation: "± 0.20 dB/km",
    rate: 0.2
  },
  {
    name: "1577 / 1270 nm",
    function: "XGS-PON 10G",
    attenuation: "± 0.25 dB/km",
    rate: 0.25
  }
];

export const COMPONENT_LOSSES = [
  ["Fusion splice", "0.05 – 0.10 dB / titik"],
  ["Mechanical splice", "0.20 – 0.50 dB / titik"],
  ["Konektor / adapter", "0.20 – 0.50 dB / pasang"],
  ["Fast connector", "0.30 – 0.75 dB / titik"],
  ["Kabel 1310 nm", "± 0.35 dB / km"],
  ["Kabel 1490 / 1550 nm", "± 0.22 dB / km"]
];

export function findFiberColor(coreNumber) {
  const validCore = Math.min(Math.max(Number(coreNumber) || 1, 1), 288);
  const tubeNumber = Math.ceil(validCore / 12);
  const tubeColor = FIBER_COLORS[(tubeNumber - 1) % 12];
  const corePosition = ((validCore - 1) % 12) + 1;
  const coreColor = FIBER_COLORS[corePosition - 1];

  return {
    coreNumber: validCore,
    tubeNumber,
    tubeColor,
    corePosition,
    coreColor
  };
}


