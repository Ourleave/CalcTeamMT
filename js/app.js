import { SPLITTERS, BALANCED_SPLITTERS, getSplitterById } from "./data/splitters.js";
import {
  COMPONENT_LOSSES,
  FIBER_COLORS,
  WAVELENGTHS,
  findFiberColor
} from "./data/fiber-reference.js";
import { getSignalStatus } from "./data/ont-profiles.js";
import { calculateSplitterOutput, calculatePortOutputs } from "./calculators/splitter.js";
import { calculateBudgetLink } from "./calculators/budget-link.js";
import { estimateFiberDistance } from "./calculators/distance.js";
import { renderDashboardResults, renderResultPage } from "./components/results.js";
import { showToast } from "./components/toast.js";
import { createNavigation } from "./navigation.js";
import { clearHistory, filterHistory, getHistory, saveHistory } from "./storage/history.js";
import {
  escapeHtml,
  formatDateTime,
  formatDb,
  formatDbm,
  nonNegative,
  numberValue,
  wholeNumber
} from "./validation.js";

const state = {
  mode: "prediction",
  selectedTableSplitter: "1:8",
  historyFilter: "all",
  calculation: null
};

const calculatorPanel = document.querySelector(".calculator-panel");
const calculatorHomeParent = calculatorPanel?.parentElement;
const calculatorHomeNextSibling = calculatorPanel?.nextElementSibling;

function getCalculatorData() {
  return {
    inputPower: numberValue(document.getElementById("input-power")?.value),
    splitterId: document.getElementById("splitter-type")?.value || "1:8",
    spliceCount: wholeNumber(document.getElementById("splice-count")?.value),
    fiberLength: nonNegative(document.getElementById("fiber-length")?.value),
    connectorLoss: nonNegative(document.getElementById("connector-loss")?.value),
    otherLoss: nonNegative(document.getElementById("other-loss")?.value)
  };
}

function populateSplitterSelect() {
  const select = document.getElementById("splitter-type");
  if (!select) return;

  const balanced = SPLITTERS.filter((item) => item.type === "balanced");
  const unbalanced = SPLITTERS.filter((item) => item.type === "unbalanced");

  select.innerHTML = `
    <optgroup label="PLC Balanced">
      ${balanced.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
    </optgroup>
    <optgroup label="FBT Unbalanced">
      ${unbalanced.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
    </optgroup>
  `;

  select.value = "1:8";
}

function calculateCurrent() {
  const data = getCalculatorData();

  /*
    Mode pengukuran tetap menggunakan rumus yang sama:
    nilai input dianggap sebagai daya hasil ukur pada titik sebelum
    loss yang dipilih oleh teknisi menuju sisi ONT.
  */
  const calculation = calculateSplitterOutput(data);

  state.calculation = calculation;

  renderDashboardResults(calculation);
  renderResultPage(calculation);
  renderSplitterPreview();
  renderSplitterTable();

  return calculation;
}

function submitCalculation(event) {
  event.preventDefault();

  const calculation = calculateCurrent();
  const status = getSignalStatus(calculation.outputPower);

  saveHistory({
    title:
      state.mode === "measurement"
        ? "Pengukuran ODP"
        : `Prediksi Splitter ${calculation.splitter.id}`,
    mode: state.mode,
    outputPower: calculation.outputPower,
    totalLoss: calculation.totalLoss,
    status: status.shortLabel,
    splitterId: calculation.splitter.id,
    inputPower: calculation.inputPower
  });

  renderHistory();
  navigation.go("result");
  showToast("Perhitungan berhasil disimpan ke riwayat.");
}

function setCalculationMode(mode) {
  state.mode = mode;

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  const title = document.querySelector(".calculator-panel .panel-heading h2");
  const description = document.querySelector(".calculator-panel .panel-heading p");
  const inputLabel = document.querySelector('label[for="input-power"]');

  if (title) {
    title.innerHTML = `<span class="heading-icon">⌁</span> ${
      mode === "measurement" ? "Hasil Pengukuran" : "Kalkulator Redaman"
    }`;
  }

  if (description) {
    description.textContent =
      mode === "measurement"
        ? "Masukkan daya OPM pada titik sebelum splitter untuk memprediksi daya yang diterima ONT."
        : "Masukkan parameter untuk menghitung prediksi daya output atau memeriksa hasil pengukuran.";
  }

  if (inputLabel) {
    inputLabel.querySelector("span").textContent =
      mode === "measurement"
        ? "Daya Ukur ODP (dBm)"
        : "Daya Input (dBm)";
  }
}

function renderSplitterPreview() {
  const body = document.getElementById("splitter-preview-body");
  if (!body || !state.calculation) return;

  const inputPower = state.calculation.inputPower;

  body.innerHTML = BALANCED_SPLITTERS.map((splitter) => {
    const output = inputPower - splitter.loss;
    const status = getSignalStatus(output);

    return `
      <tr>
        <td>${splitter.id}</td>
        <td>${formatDb(splitter.loss)}</td>
        <td>${formatDbm(output)}</td>
        <td><span class="table-status ${status.key}">${status.shortLabel}</span></td>
      </tr>
    `;
  }).join("");
}

function renderSplitterFilter() {
  const target = document.getElementById("splitter-filter");
  if (!target) return;

  const quickSplitters = [
    ...BALANCED_SPLITTERS,
    { id: "unbalanced", label: "Tidak Seimbang" }
  ];

  target.innerHTML = quickSplitters
    .map(
      (splitter) => `
        <button
          class="${splitter.id === state.selectedTableSplitter ? "active" : ""}"
          data-splitter-filter="${splitter.id}"
        >
          ${splitter.id === "unbalanced" ? splitter.label : splitter.id}
        </button>
      `
    )
    .join("");

  target.querySelectorAll("[data-splitter-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.splitterFilter;

      if (id === "unbalanced") {
        state.selectedTableSplitter = "90:10-10";
      } else {
        state.selectedTableSplitter = id;
      }

      renderSplitterFilter();
      renderSplitterTable();
    });
  });
}

function renderSplitterTable() {
  const table = document.getElementById("splitter-port-table");
  const title = document.getElementById("selected-splitter-name");
  const loss = document.getElementById("splitter-detail-loss");
  const output = document.getElementById("splitter-detail-output");

  if (!table || !state.calculation) return;

  const splitter = getSplitterById(state.selectedTableSplitter);
  const ports = calculatePortOutputs(
    state.calculation.inputPower,
    state.selectedTableSplitter
  );

  if (title) {
    title.textContent =
      splitter.type === "unbalanced"
        ? `Splitter FBT ${splitter.ratio}`
        : `Splitter ${splitter.id}`;
  }

  if (loss) loss.textContent = formatDb(splitter.loss);
  if (output) output.textContent = formatDbm(ports[0]?.outputPower ?? 0);

  table.innerHTML = ports
    .map(
      (port) => `
        <tr>
          <td>${splitter.type === "unbalanced" ? splitter.portLabel : port.port}</td>
          <td>${formatDb(port.loss)}</td>
          <td>${formatDbm(port.outputPower)}</td>
        </tr>
      `
    )
    .join("");
}

function historyRow(item) {
  const status = getSignalStatus(item.outputPower);
  const date = new Date(item.createdAt);

  return `
    <article class="history-row">
      <span class="history-dot"></span>
      <div class="history-row-main">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${formatDateTime(date)}</small>
      </div>
      <div class="history-row-result">
        <strong>${formatDbm(item.outputPower)}</strong>
        <span class="table-status ${status.key}">${status.shortLabel}</span>
      </div>
    </article>
  `;
}

function renderHistory() {
  const miniTarget = document.getElementById("mini-history-list");
  const fullTarget = document.getElementById("full-history-list");

  const allItems = getHistory();
  const filteredItems = filterHistory(state.historyFilter);

  if (miniTarget) {
    const miniItems = allItems.slice(0, 4);

    miniTarget.innerHTML = miniItems.length
      ? miniItems.map(historyRow).join("")
      : `<p class="empty-state">Belum ada riwayat perhitungan.</p>`;
  }

  if (fullTarget) {
    fullTarget.innerHTML = filteredItems.length
      ? filteredItems.map(historyRow).join("")
      : `<p class="empty-state">Belum ada riwayat pada kategori ini.</p>`;
  }
}

function referenceItem(id, icon, title, subtitle) {
  return `
    <button class="reference-item" data-reference-item="${id}">
      <span class="reference-item-icon">${icon}</span>
      <span>
        <strong>${title}</strong>
        <small>${subtitle}</small>
      </span>
      <b>›</b>
    </button>
  `;
}

function renderReferenceList(query = "") {
  const target = document.getElementById("reference-list");
  if (!target) return;

  const refs = [
    ["budget-link", "⌁", "Budget Link", "Perhitungan margin daya OLT ke ONT"],
    ["distance", "●", "Estimasi Jarak", "Estimasi panjang kabel dari nilai redaman"],
    ["ont", "▣", "ONT & Perangkat", "Sensitivitas penerima dan batas sinyal ONT"],
    ["color", "◉", "Warna Fiber", "Kode warna core dan tube fiber"],
    ["component", "▤", "Redaman Komponen", "Nilai loss komponen jaringan FTTH"],
    ["wavelength", "⌁", "Panjang Gelombang", "Referensi 1310, 1490, 1550, dan XGS-PON"]
  ];

  const keyword = query.trim().toLowerCase();
  const filtered = refs.filter((item) =>
    `${item[2]} ${item[3]}`.toLowerCase().includes(keyword)
  );

  target.innerHTML = filtered.map((item) => referenceItem(...item)).join("");

  target.querySelectorAll("[data-reference-item]").forEach((button) => {
    button.addEventListener("click", () => {
      renderReferenceContent(button.dataset.referenceItem);
    });
  });
}

function renderReferenceContent(referenceId) {
  const target = document.getElementById("reference-content");
  if (!target) return;

  if (referenceId === "budget-link") {
    const example = calculateBudgetLink({
      txPower: 4,
      fiberLength: 5,
      splitterLosses: [7.2, 13.8],
      spliceCount: 4,
      connectorLoss: 0.5,
      safetyMargin: 1.5
    });

    target.innerHTML = `
      <section class="panel calculator-panel">
        <div class="panel-heading">
          <div>
            <h2>Budget Link OLT ke ONT</h2>
            <p>Alat bantu perencanaan; tidak diperlukan untuk kalkulator ODP lapangan.</p>
          </div>
        </div>
        <div class="loss-breakdown">
          <div><span>Contoh TX OLT</span><strong>${formatDbm(example.txPower)}</strong></div>
          <div><span>Total loss contoh</span><strong>${formatDb(example.totalLoss)}</strong></div>
          <div class="loss-total"><strong>Estimasi RX ONT</strong><strong>${formatDbm(example.rxPower)}</strong></div>
        </div>
      </section>
    `;
    return;
  }

  if (referenceId === "distance") {
    const result = estimateFiberDistance({ fiberLoss: 1.4, attenuationPerKm: 0.35 });

    target.innerHTML = `
      <section class="panel calculator-panel">
        <div class="panel-heading">
          <div>
            <h2>Estimasi Jarak Fiber</h2>
            <p>Gunakan nilai loss fiber bersih setelah dikurangi loss splitter dan konektor.</p>
          </div>
        </div>
        <div class="loss-breakdown">
          <div><span>Contoh redaman fiber</span><strong>1.4 dB</strong></div>
          <div><span>Koefisien 1310 nm</span><strong>0.35 dB/km</strong></div>
          <div class="loss-total"><strong>Estimasi jarak</strong><strong>${result.kilometers.toFixed(2)} km (${result.meters} m)</strong></div>
        </div>
      </section>
    `;
    return;
  }

  if (referenceId === "ont") {
    target.innerHTML = `
      <section class="panel splitter-preview-panel">
        <div class="panel-heading"><h2>Sensitivitas ONT GPON</h2></div>
        <div class="loss-breakdown">
          <div><span>Terlalu kuat</span><strong class="metric-status bad">&gt; -8 dBm</strong></div>
          <div><span>Ideal</span><strong class="metric-status normal">-8 s/d -24 dBm</strong></div>
          <div><span>Waspada</span><strong class="metric-status warning">-24 s/d -27 dBm</strong></div>
          <div><span>LOS / Drop</span><strong class="metric-status bad">&lt; -27 dBm</strong></div>
        </div>
      </section>
    `;
    return;
  }

  if (referenceId === "color") {
    const example = findFiberColor(15);

    target.innerHTML = `
      <section class="panel splitter-preview-panel">
        <div class="panel-heading">
          <div>
            <h2>Kode Warna Fiber</h2>
            <p>Contoh Core ${example.coreNumber}: Tube ${example.tubeNumber}, posisi core ${example.corePosition}.</p>
          </div>
        </div>
        <div class="color-reference-grid">
          ${FIBER_COLORS.map(
            (color) => `
              <div class="color-reference-item">
                <span style="background:${color.hex}"></span>
                <small>${color.no}. ${color.name}</small>
              </div>
            `
          ).join("")}
        </div>
      </section>
    `;
    return;
  }

  if (referenceId === "component") {
    target.innerHTML = `
      <section class="panel splitter-preview-panel">
        <div class="panel-heading"><h2>Referensi Redaman Komponen</h2></div>
        <div class="loss-breakdown">
          ${COMPONENT_LOSSES.map(
            ([name, value]) => `
              <div><span>${name}</span><strong>${value}</strong></div>
            `
          ).join("")}
        </div>
      </section>
    `;
    return;
  }

  if (referenceId === "wavelength") {
    target.innerHTML = `
      <section class="panel splitter-preview-panel">
        <div class="panel-heading"><h2>Panduan Panjang Gelombang</h2></div>
        <div class="loss-breakdown">
          ${WAVELENGTHS.map(
            (item) => `
              <div>
                <span>${item.name} — ${item.function}</span>
                <strong>${item.attenuation}</strong>
              </div>
            `
          ).join("")}
        </div>
      </section>
    `;
  }
}

function moveCalculatorTo(route) {
  const mobileSlot = document.getElementById("mobile-calculator-slot");

  if (!calculatorPanel || !mobileSlot || !calculatorHomeParent) return;

  if (route === "calculator") {
    mobileSlot.append(calculatorPanel);
    return;
  }

  if (calculatorPanel.parentElement === mobileSlot) {
    calculatorHomeParent.insertBefore(calculatorPanel, calculatorHomeNextSibling);
  }
}

const THEMES = [
  { id: "light", name: "Terang", dark: false, colors: ["#ffffff", "#1677ff", "#eaf3ff"] },
  { id: "dark", name: "Gelap", dark: true, colors: ["#142440", "#1677ff", "#0d1a30"] },
  { id: "ocean", name: "Samudra", dark: true, colors: ["#0f3a45", "#14c8c8", "#071f27"] },
  { id: "sunset", name: "Senja", dark: true, colors: ["#3a1f3d", "#ff7a45", "#1e1024"] },
  { id: "forest", name: "Hutan", dark: false, colors: ["#ffffff", "#16a34a", "#e8f7ee"] },
  { id: "violet", name: "Ungu Neon", dark: true, colors: ["#251a4a", "#a855f7", "#120b2b"] },
  { id: "amoled", name: "AMOLED", dark: true, colors: ["#0b0b0b", "#3b9bff", "#000000"] }
];

const THEME_KEY = "calcteammt-pro-theme";
const PROFILE_KEY = "calcteammt-pro-profile";
const DEFAULT_PROFILE = { name: "Teknisi FTTH", division: "Divisi Teknis" };

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* penyimpanan penuh atau diblokir: abaikan */
  }
}

function findTheme(id) {
  return THEMES.find((theme) => theme.id === id) || THEMES[0];
}

function applyTheme(id) {
  const theme = findTheme(id);

  document.documentElement.setAttribute("data-theme", theme.id);
  writeStorage(THEME_KEY, theme.id);

  const label = document.getElementById("theme-label");
  if (label) label.textContent = theme.name;

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme.colors[2]);

  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    const active = button.dataset.themeOption === theme.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function toggleTheme() {
  // Tombol cepat: pindah antara terang dan gelap.
  const current = findTheme(document.documentElement.getAttribute("data-theme"));
  applyTheme(current.dark ? "light" : "dark");
}

function renderThemePicker() {
  const target = document.getElementById("theme-picker");
  if (!target) return;

  target.innerHTML = THEMES.map(
    (theme) => `
      <button type="button" class="theme-option" data-theme-option="${theme.id}" aria-pressed="false">
        <span class="theme-swatch" style="--sw-a:${theme.colors[0]};--sw-b:${theme.colors[1]};--sw-c:${theme.colors[2]}">
          <i></i><i></i><i></i>
        </span>
        <small>${theme.name}</small>
      </button>
    `
  ).join("");

  target.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeOption);
      showToast(`Tampilan ${findTheme(button.dataset.themeOption).name} diterapkan.`);
    });
  });
}

function setupTheme() {
  renderThemePicker();
  applyTheme(readStorage(THEME_KEY) || "light");

  document.getElementById("theme-toggle-mobile")?.addEventListener("click", toggleTheme);
  document.getElementById("theme-toggle-setting")?.addEventListener("click", () => {
    document.getElementById("theme-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function getProfile() {
  try {
    const stored = JSON.parse(readStorage(PROFILE_KEY));
    return {
      name: String(stored?.name || "").trim() || DEFAULT_PROFILE.name,
      division: String(stored?.division || "").trim() || DEFAULT_PROFILE.division
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function renderProfile() {
  const profile = getProfile();
  const initial = profile.name.charAt(0).toUpperCase() || "T";

  document.querySelectorAll("[data-profile-initial]").forEach((el) => {
    el.textContent = initial;
  });
  document.querySelectorAll("[data-profile-name]").forEach((el) => {
    el.textContent = profile.name;
  });
  document.querySelectorAll("[data-profile-division]").forEach((el) => {
    el.textContent = profile.division;
  });
}

function setupProfileEditor() {
  const form = document.getElementById("profile-form");
  const editButton = document.getElementById("profile-edit-button");
  const cancelButton = document.getElementById("profile-cancel-button");
  const nameInput = document.getElementById("profile-name-input");
  const divisionInput = document.getElementById("profile-division-input");

  if (!form || !editButton) return;

  function openForm() {
    const profile = getProfile();
    nameInput.value = profile.name;
    divisionInput.value = profile.division;
    form.hidden = false;
    editButton.hidden = true;
    nameInput.focus();
  }

  function closeForm() {
    form.hidden = true;
    editButton.hidden = false;
  }

  editButton.addEventListener("click", openForm);
  cancelButton?.addEventListener("click", closeForm);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const division = divisionInput.value.trim();

    if (!name) {
      showToast("Nama tidak boleh kosong.");
      nameInput.focus();
      return;
    }

    writeStorage(PROFILE_KEY, JSON.stringify({ name, division }));
    renderProfile();
    closeForm();
    showToast("Profil berhasil diperbarui.");
  });

  renderProfile();
}

function setupHistoryTabs() {
  document.querySelectorAll("[data-history-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.historyFilter = button.dataset.historyFilter;

      document.querySelectorAll("[data-history-filter]").forEach((item) => {
        item.classList.toggle(
          "active",
          item.dataset.historyFilter === state.historyFilter
        );
      });

      renderHistory();
    });
  });

  document.getElementById("clear-history-button")?.addEventListener("click", () => {
    if (!confirm("Hapus seluruh riwayat perhitungan di perangkat ini?")) return;

    clearHistory();
    renderHistory();
    showToast("Seluruh riwayat telah dihapus.");
  });
}

function setupReferenceSearch() {
  document.getElementById("reference-search")?.addEventListener("input", (event) => {
    renderReferenceList(event.target.value);
  });

  document.querySelectorAll("[data-reference]").forEach((button) => {
    button.addEventListener("click", () => {
      navigation.go("reference");
      renderReferenceContent(button.dataset.reference);
    });
  });
}

function setupCalculatorEvents() {
  document.getElementById("calculator-form")?.addEventListener("submit", submitCalculation);

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      setCalculationMode(button.dataset.mode);
      calculateCurrent();
    });
  });

  [
    "input-power",
    "splitter-type",
    "splice-count",
    "fiber-length",
    "connector-loss",
    "other-loss"
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", calculateCurrent);
    document.getElementById(id)?.addEventListener("change", calculateCurrent);
  });
}

const navigation = createNavigation({
  onRouteChange(route) {
    moveCalculatorTo(route);

    if (route === "result") renderResultPage(state.calculation);
    if (route === "history") renderHistory();
    if (route === "splitter-table") {
      renderSplitterFilter();
      renderSplitterTable();
    }
    if (route === "reference") renderReferenceList();
  }
});

function updateHeaderDate() {
  const target = document.getElementById("header-date");
  if (!target) return;

  target.textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function init() {
  populateSplitterSelect();
  setupTheme();
  setupProfileEditor();
  setupCalculatorEvents();
  setupHistoryTabs();
  setupReferenceSearch();

  navigation.init();
  updateHeaderDate();

  state.calculation = calculateCurrent();

  renderSplitterFilter();
  renderHistory();
  renderReferenceList();

    document.getElementById("help-button")?.addEventListener("click", () => {
    showToast(
      "Masukkan daya ODP hasil ukur, pilih splitter, lalu tekan Hitung Sekarang."
    );
  });

  document.getElementById("global-search")?.addEventListener("input", (event) => {
    const keyword = event.target.value.trim().toLowerCase();

    if (!keyword) return;

    const routes = [
      {
        keywords: ["kalkulator", "redaman", "splitter"],
        route: "calculator"
      },
      {
        keywords: ["hasil", "output", "ont"],
        route: "result"
      },
      {
        keywords: ["tabel", "loss"],
        route: "splitter-table"
      },
      {
        keywords: ["referensi", "warna", "lambda", "ont"],
        route: "reference"
      },
      {
        keywords: ["riwayat", "history"],
        route: "history"
      }
    ];

    const match = routes.find((item) =>
      item.keywords.some((word) => word.includes(keyword) || keyword.includes(word))
    );

    if (match) {
      navigation.go(match.route);
      event.target.value = "";
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .catch((error) => console.warn("Service worker gagal:", error));
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
