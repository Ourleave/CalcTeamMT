export const SPLITTERS = [
  {
    id: "1:2",
    label: "1:2 (3.5 dB)",
    type: "balanced",
    ports: 2,
    loss: 3.5
  },
  {
    id: "1:4",
    label: "1:4 (7.2 dB)",
    type: "balanced",
    ports: 4,
    loss: 7.2
  },
  {
    id: "1:8",
    label: "1:8 (10.5 dB)",
    type: "balanced",
    ports: 8,
    loss: 10.5
  },
  {
    id: "1:16",
    label: "1:16 (13.8 dB)",
    type: "balanced",
    ports: 16,
    loss: 13.8
  },
  {
    id: "1:32",
    label: "1:32 (17.0 dB)",
    type: "balanced",
    ports: 32,
    loss: 17.0
  },
  {
    id: "90:10-10",
    label: "FBT 90:10 — Port 10% (10.5 dB)",
    type: "unbalanced",
    ports: 1,
    loss: 10.5,
    ratio: "90:10",
    portLabel: "Port Drop 10%"
  },
  {
    id: "90:10-90",
    label: "FBT 90:10 — Port 90% (0.5 dB)",
    type: "unbalanced",
    ports: 1,
    loss: 0.5,
    ratio: "90:10",
    portLabel: "Port Terusan 90%"
  },
  {
    id: "95:5-5",
    label: "FBT 95:5 — Port 5% (13.5 dB)",
    type: "unbalanced",
    ports: 1,
    loss: 13.5,
    ratio: "95:5",
    portLabel: "Port Drop 5%"
  },
  {
    id: "95:5-95",
    label: "FBT 95:5 — Port 95% (0.3 dB)",
    type: "unbalanced",
    ports: 1,
    loss: 0.3,
    ratio: "95:5",
    portLabel: "Port Terusan 95%"
  },
  {
    id: "98:2-2",
    label: "FBT 98:2 — Port 2% (17.5 dB)",
    type: "unbalanced",
    ports: 1,
    loss: 17.5,
    ratio: "98:2",
    portLabel: "Port Drop 2%"
  },
  {
    id: "98:2-98",
    label: "FBT 98:2 — Port 98% (0.2 dB)",
    type: "unbalanced",
    ports: 1,
    loss: 0.2,
    ratio: "98:2",
    portLabel: "Port Terusan 98%"
  }
];

export const ONT_THRESHOLDS = {
  TOO_STRONG: -8,
  NORMAL_MIN: -24,
  WARNING_MIN: -27
};

export function getSignalStatus(power) {
  if (power > -8) {
    return {
      level: "too-strong",
      label: "Terlalu Kuat",
      description: "Sinyal terlalu tinggi, berisiko merusak receiver ONT.",
      badgeClass: "badge-danger"
    };
  }
  if (power >= -24) {
    return {
      level: "normal",
      label: "Normal / Optimal",
      description: "Sinyal berada dalam batas ideal layanan GPON.",
      badgeClass: "badge-success"
    };
  }
  if (power >= -27) {
    return {
      level: "warning",
      label: "Peringatan (Margin Tipis)",
      description: "Sinyal mulai melemah, mendekati batas drop.",
      badgeClass: "badge-warning"
    };
  }
  return {
    level: "los",
    label: "Drop / LOS",
    description: "Sinyal di bawah -27 dBm, layanan berpotensi terputus.",
    badgeClass: "badge-danger"
  };
}

export function getMargin(power) {
  // Margin terhadap ambang batas -27 dBm
  const limit = -27;
  return Number((power - limit).toFixed(2));
}
