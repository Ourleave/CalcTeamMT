const STORAGE_KEY = "calcteammt-pro-history";
const MAX_HISTORY = 50;

function safelyParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

export function getHistory() {
  return safelyParse(localStorage.getItem(STORAGE_KEY), []);
}

export function saveHistory(item) {
  const history = getHistory();

  const record = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
    ...item
  };

  const nextHistory = [record, ...history].slice(0, MAX_HISTORY);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));

  return record;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function filterHistory(type = "all") {
  const history = getHistory();

  if (type === "all") return history;
  return history.filter((item) => item.mode === type);
}


