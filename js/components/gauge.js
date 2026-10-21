function gaugePercentage(power) {
  /*
    Skala:
    -30 dBm = 0%
    -8 dBm  = 100%

    Nilai -18.7 berada sekitar 51%, agar tampilan gauge
    mirip dengan rancangan UI.
  */
  const min = -30;
  const max = -8;
  return Math.max(0, Math.min(100, ((power - min) / (max - min)) * 100));
}

export function updateGauge({
  power,
  statusKey = "normal",
  progressElement,
  valueElement,
  statusElement
}) {
  if (!progressElement) return;

  const percentage = gaugePercentage(power);
  const totalLength = 180;
  const offset = totalLength - (totalLength * percentage) / 100;

  progressElement.style.strokeDasharray = String(totalLength);
  progressElement.style.strokeDashoffset = String(offset);

  const colorMap = {
    normal: "var(--success)",
    warning: "var(--warning)",
    bad: "var(--danger)"
  };

  progressElement.style.stroke = colorMap[statusKey] || colorMap.normal;

  if (valueElement) valueElement.textContent = Number(power).toFixed(1);

  if (statusElement) {
    statusElement.className = `status-pill ${statusKey}`;
  }
}

export function createGaugeMarkup(power, status) {
  const percentage = gaugePercentage(power);
  const totalLength = 180;
  const offset = totalLength - (totalLength * percentage) / 100;

  return `
    <div class="gauge-wrap">
      <svg class="signal-gauge" viewBox="0 0 150 90" aria-label="Indikator kualitas sinyal">
        <path class="gauge-track" d="M 18 75 A 57 57 0 0 1 132 75"></path>
        <path
          class="gauge-progress"
          d="M 18 75 A 57 57 0 0 1 132 75"
          style="stroke: var(--${status.key === "normal" ? "success" : status.key === "warning" ? "warning" : "danger"}); stroke-dasharray: 180; stroke-dashoffset: ${offset};"
        ></path>
      </svg>
      <div class="gauge-value">
        <strong>${Number(power).toFixed(1)}</strong>
        <span>dBm</span>
      </div>
      <span class="status-pill ${status.key}">${status.shortLabel}</span>
    </div>
  `;
}


