import { formatDb, formatDbm } from "../validation.js";
import { getMargin, getSignalStatus } from "../data/ont-profiles.js";
import { createGaugeMarkup, updateGauge } from "./gauge.js";

function lossRows(calculation) {
  const { losses, splitter, spliceCount, fiberLength } = calculation;

  return [
    ["Splitter", `${splitter.id}`, losses.splitter],
    ["Splice", `${spliceCount}x`, losses.splice],
    ["Serat Optik", `${fiberLength.toFixed(1)} km`, losses.fiber],
    ["Konektor", "", losses.connector],
    ["Lainnya", "", losses.other]
  ];
}

export function renderDashboardResults(calculation) {
  const status = getSignalStatus(calculation.outputPower);
  const margin = getMargin(calculation.outputPower);

  const output = document.getElementById("result-power");
  const metricOutput = document.getElementById("metric-output");
  const metricMargin = document.getElementById("metric-margin");
  const metricStatus = document.getElementById("metric-status");
  const statusElement = document.getElementById("result-status");
  const gaugeProgress = document.getElementById("gauge-progress");
  const breakdownList = document.getElementById("loss-breakdown-list");
  const totalLoss = document.getElementById("total-loss");
  const lastUpdated = document.getElementById("last-updated");

  if (output) output.textContent = calculation.outputPower.toFixed(1);
  if (metricOutput) metricOutput.textContent = formatDbm(calculation.outputPower);
  if (metricMargin) metricMargin.textContent = formatDb(margin);
  if (totalLoss) totalLoss.textContent = formatDb(calculation.totalLoss);

  if (metricStatus) {
    metricStatus.textContent = status.shortLabel;
    metricStatus.className = `metric-status ${status.key}`;
  }

  if (statusElement) {
    statusElement.textContent = status.shortLabel;
  }

  updateGauge({
    power: calculation.outputPower,
    statusKey: status.key,
    progressElement: gaugeProgress,
    valueElement: output,
    statusElement
  });

  if (breakdownList) {
    breakdownList.innerHTML = lossRows(calculation)
      .map(
        ([label, detail, value]) => `
          <div>
            <span>${label}${detail ? ` (${detail})` : ""}</span>
            <strong>${formatDb(value)}</strong>
          </div>
        `
      )
      .join("");
  }

  if (lastUpdated) {
    lastUpdated.textContent = `Terakhir diperbarui: ${new Intl.DateTimeFormat(
      "id-ID",
      { dateStyle: "medium", timeStyle: "short" }
    ).format(new Date())}`;
  }
}

export function renderResultPage(calculation) {
  const status = getSignalStatus(calculation.outputPower);
  const margin = getMargin(calculation.outputPower);

  const gaugeTarget = document.getElementById("result-page-gauge");
  const detailsTarget = document.getElementById("result-page-details");
  const breakdownTarget = document.getElementById("result-page-breakdown");
  const recommendationTarget = document.getElementById("result-recommendation");

  if (gaugeTarget) {
    gaugeTarget.innerHTML = createGaugeMarkup(calculation.outputPower, status);
  }

  if (detailsTarget) {
    detailsTarget.innerHTML = `
      <div class="result-metrics">
        <div>
          <span>Daya Input</span>
          <strong>${formatDbm(calculation.inputPower)}</strong>
        </div>
        <div>
          <span>Daya Output</span>
          <strong>${formatDbm(calculation.outputPower)}</strong>
        </div>
        <div>
          <span>Margin terhadap batas -27 dBm</span>
          <strong>${formatDb(margin)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong class="metric-status ${status.key}">${status.label}</strong>
        </div>
      </div>
    `;
  }

  if (breakdownTarget) {
    breakdownTarget.innerHTML = `
      <div class="loss-breakdown">
        ${lossRows(calculation)
          .map(
            ([label, detail, value]) => `
              <div>
                <span>${label}${detail ? ` (${detail})` : ""}</span>
                <strong>${formatDb(value)}</strong>
              </div>
            `
          )
          .join("")}
        <div class="loss-total">
          <strong>Total Redaman</strong>
          <strong>${formatDb(calculation.totalLoss)}</strong>
        </div>
      </div>
    `;
  }

  if (recommendationTarget) {
    recommendationTarget.innerHTML = `
      <strong>✓ ${status.label}</strong>
      <br>
      ${status.recommendation}
    `;
  }
}


