export const ONT_THRESHOLDS = {
  TOO_STRONG: -8,
  NORMAL_MIN: -24,
  WARNING_MIN: -27
};

export function getSignalStatus(power) {
  const value = Number(power);

  if (value > ONT_THRESHOLDS.TOO_STRONG) {
    return {
      key: "bad",
      level: "too-strong",
      label: "Terlalu Kuat",
      shortLabel: "Terlalu Kuat",
      description: "Sinyal terlalu tinggi, berisiko merusak receiver ONT.",
      recommendation:
        "Pasang attenuator atau gunakan splitter dengan redaman lebih besar agar daya tidak melebihi -8 dBm.",
      badgeClass: "badge-danger"
    };
  }

  if (value >= ONT_THRESHOLDS.NORMAL_MIN) {
    return {
      key: "normal",
      level: "normal",
      label: "Normal / Optimal",
      shortLabel: "Normal",
      description: "Sinyal berada dalam batas ideal layanan GPON.",
      recommendation:
        "Sinyal berada dalam batas ideal (-8 s/d -24 dBm). Tidak perlu tindakan.",
      badgeClass: "badge-success"
    };
  }

  if (value >= ONT_THRESHOLDS.WARNING_MIN) {
    return {
      key: "warning",
      level: "warning",
      label: "Peringatan (Margin Tipis)",
      shortLabel: "Waspada",
      description: "Sinyal mulai melemah, mendekati batas drop.",
      recommendation:
        "Margin tipis. Periksa konektor, tikungan kabel, dan titik splice sebelum sinyal turun lagi.",
      badgeClass: "badge-warning"
    };
  }

  return {
    key: "bad",
    level: "los",
    label: "Drop / LOS",
    shortLabel: "Drop / LOS",
    description: "Sinyal di bawah -27 dBm, layanan berpotensi terputus.",
    recommendation:
      "Sinyal di bawah -27 dBm. Cek redaman jalur, bersihkan konektor, dan ulang splice yang bermasalah.",
    badgeClass: "badge-danger"
  };
}

export function getMargin(power) {
  // Margin terhadap ambang batas -27 dBm
  return Number((Number(power) - ONT_THRESHOLDS.WARNING_MIN).toFixed(2));
}
