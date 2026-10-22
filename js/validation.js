export function numberValue(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function nonNegative(value, fallback = 0) {
  return Math.max(0, numberValue(value, fallback));
}

export function wholeNumber(value, fallback = 0) {
  return Math.max(0, Math.round(numberValue(value, fallback)));
}

export function formatDb(value, digits = 1) {
  return `${numberValue(value).toFixed(digits)} dB`;
}

export function formatDbm(value, digits = 1) {
  return `${numberValue(value).toFixed(digits)} dBm`;
}

export function formatDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}



export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
