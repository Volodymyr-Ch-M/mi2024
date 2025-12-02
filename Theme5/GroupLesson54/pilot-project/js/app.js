const state = {
  charts: {},
  maps: {},
  paletteMode: "good",
  designMode: "balanced",
  structureMode: "good",
  algoChart: null,
};

const paletteGood = ["#c7a24f", "#7fb069", "#5f6f52", "#8cae68", "#b7c9a6"];
const paletteBad = ["#ff007f", "#ff5400", "#ffd400", "#39ff14", "#00d9ff", "#c300ff", "#ff9ee6"];

const rand = (min, max) => Math.round(Math.random() * (max - min) + min);
const generateSeries = (len, min, max) => Array.from({ length: len }, () => rand(min, max));

// Навчальний гід
function initQuestionGuide() {
  const select = document.getElementById("questionSelect");
  const result = document.getElementById("questionResult");
  if (!select || !result) return;
  const options = {
    compare: {
      title: "Порівняння напрямків",
      good: ["Стовпчики / grouped bars", "Лінії для кількох серій", "Small multiples для 5+ категорій"],
      bad: ["Секторна з 8+ категорій", "3D-ефекти"],
      hint: "Понад 7 категорій — розбивайте на окремі графіки або сортуйте за спаданням.",
    },
    trend: {
      title: "Показати динаміку",
      good: ["Лінія / area зі згладженням", "Sparkline для коротких фактів"],
      bad: ["Колонки при дрібному кроці", "Heatmap без легенди"],
      hint: "Підписуйте ключові події прямо на лінії.",
    },
    structure: {
      title: "Структура / частки",
      good: ["Кільце (до 5–6 сегментів)", "Treemap для багатьох підгруп", "Stacked bar для двох серій"],
      bad: ["3D-пироги", "Секторна на шумних даних"],
      hint: "Використовуйте відсотки або абсолютні значення послідовно.",
    },
    distribution: {
      title: "Розподіл",
      good: ["Boxplot / violin", "Histogram / density", "Heatmap для щільності"],
      bad: ["Лише середнє значення", "Накладання гістограм без прозорості"],
      hint: "Показуйте розкид і медіану — це відповість на «наскільки стабільно».",
    },
    geo: {
      title: "Географія",
      good: ["Маркери за рівнями", "Хлороплет", "Градуйовані кола"],
      bad: ["Забагато шарів прозорості", "Карта без легенди"],
      hint: "Додавайте tooltip з ключовими метриками для маркерів.",
    },
  };
  const render = (type) => {
    const item = options[type];
    result.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Рекомендуємо:</strong> ${item.good.join(", ")}.</p>
      <p><strong>Уникаємо:</strong> ${item.bad.join(", ")}.</p>
      <p class="muted">${item.hint}</p>
    `;
  };
  render(select.value);
  select.addEventListener("change", (e) => render(e.target.value));
}

// Універсальна очистка
function destroyChart(key) {
  if (state.charts[key]) {
    state.charts[key].destroy();
    state.charts[key] = null;
  }
}

// Набір візуалізацій
function initGoodBadCharts() {
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const data = generateSeries(labels.length, 18, 80);
  destroyChart("goodChart");
  destroyChart("badChart");
  const goodCtx = document.getElementById("goodChart");
  if (goodCtx) {
    state.charts.goodChart = new Chart(goodCtx, {
      type: "line",
      data: { labels, datasets: [{ label: "Інтенсивність", data, borderColor: "#38bdf8", backgroundColor: "rgba(56,189,248,0.2)", tension: 0.3, fill: true }] },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  const badCtx = document.getElementById("badChart");
  if (badCtx) {
    state.charts.badChart = new Chart(badCtx, {
      type: "pie",
      data: { labels: Array.from({ length: 10 }, (_, i) => `Категорія ${i + 1}`), datasets: [{ data: generateSeries(10, 5, 40), backgroundColor: paletteBad.map(c => c + "cc") }] },
      options: { plugins: { legend: { position: "right", labels: { color: "#dce6ff" } } } }
    });
  }
}

function renderComparePair() {
  const labels = ["Маневри", "Логістика", "Розвідка", "Кібер", "ППО", "Дрони"];
  const ds1 = generateSeries(labels.length, 20, 90);
  const ds2 = generateSeries(labels.length, 20, 90);
  destroyChart("goodCompare");
  destroyChart("badCompare");
  const good = document.getElementById("goodCompare");
  const bad = document.getElementById("badCompare");
  if (good) {
    state.charts.goodCompare = new Chart(good, {
      type: "bar",
      data: { labels, datasets: [{ label: "2024", data: ds1, backgroundColor: "rgba(23,195,178,0.7)" }, { label: "2025", data: ds2, backgroundColor: "rgba(59,130,246,0.7)" }] },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  if (bad) {
    state.charts.badCompare = new Chart(bad, {
      type: "pie",
      data: { labels: Array.from({ length: 10 }, (_, i) => `Категорія ${i + 1}`), datasets: [{ data: generateSeries(10, 5, 30), backgroundColor: paletteBad.map(c => c + "cc") }] },
      options: { plugins: { legend: { position: "right", labels: { color: "#dce6ff" } } } }
    });
  }
}

function renderHeatPair() {
  destroyChart("goodHeat");
  destroyChart("badHeat");
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const cats = ["Маневри", "Логістика", "Кібер", "ППО"];
  const datasets = cats.map((c, idx) => ({
    label: c,
    data: generateSeries(labels.length, 10, 90),
    backgroundColor: paletteGood[idx % paletteGood.length] + "cc",
    stack: "heat",
  }));
  const good = document.getElementById("goodHeat");
  if (good) {
    state.charts.goodHeat = new Chart(good, {
      type: "bar",
      data: { labels, datasets },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { stacked: true, ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, y: { stacked: true, ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  const bad = document.getElementById("badHeat");
  if (bad) {
    state.charts.badHeat = new Chart(bad, {
      type: "bar",
      data: { labels: ["Середнє"], datasets: [{ label: "Середнє", data: [datasets.flatMap(d => d.data).reduce((a, b) => a + b) / (cats.length * labels.length)], backgroundColor: "#f59e0bcc" }] },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
}

function renderScatterPair() {
  destroyChart("goodScatter");
  destroyChart("badScatter");
  const good = document.getElementById("goodScatter");
  const bad = document.getElementById("badScatter");
  if (good) {
    const data = Array.from({ length: 40 }, () => ({ x: rand(5, 100), y: rand(5, 100) }));
    state.charts.goodScatter = new Chart(good, {
      type: "scatter",
      data: { datasets: [{ label: "Спостереження", data, backgroundColor: "rgba(127,176,105,0.7)" }] },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  if (bad) {
    state.charts.badScatter = new Chart(bad, {
      type: "bar",
      data: { labels: ["Середнє"], datasets: [{ data: [rand(30, 70)], backgroundColor: "#94a3b8cc" }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, x: { ticks: { color: "#dce6ff" } } } }
    });
  }
}

function renderTreemapPair() {
  destroyChart("goodTreemap");
  destroyChart("badTreemap");
  const good = document.getElementById("goodTreemap");
  const bad = document.getElementById("badTreemap");
  const labels = ["Кадри", "Техніка", "Логістика", "ППО", "Дрони"];
  const values = generateSeries(labels.length, 15, 60);
  if (good) {
    state.charts.goodTreemap = new Chart(good, {
      type: "bar",
      data: { labels, datasets: [{ label: "Частка", data: values, backgroundColor: paletteGood.map(c => c + "cc") }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { stacked: true, ticks: { color: "#dce6ff" } }, y: { stacked: true, ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  if (bad) {
    state.charts.badTreemap = new Chart(bad, {
      type: "pie",
      data: { labels, datasets: [{ data: values, backgroundColor: paletteBad.map(c => c + "cc") }] },
      options: { plugins: { legend: { position: "right", labels: { color: "#dce6ff" } }, title: { display: true, text: "3D-подібний пиріг (не варто)", color: "#ef4444" } } }
    });
  }
}

// Карти
function buildMapPoints(mode = "center") {
  const regions = { center: { lat: [48.5, 3], lng: [29, 8] }, east: { lat: [48, 2], lng: [35, 6] }, west: { lat: [49, 2.5], lng: [23, 5] } };
  const r = regions[mode] || regions.center;
  return Array.from({ length: 6 }, () => ({ coords: [r.lat[0] + Math.random() * r.lat[1], r.lng[0] + Math.random() * r.lng[1]], level: rand(1, 3), name: `Зона ${Math.floor(Math.random() * 9) + 1}` }));
}

function renderMapPair(goodId, badId, mode = "center") {
  const clearContainer = (id) => {
    const el = document.getElementById(id);
    if (el && el._leaflet_id) { try { el._leaflet_id = null; el.innerHTML = ""; } catch (e) {} }
  };
  const goodEl = goodId ? document.getElementById(goodId) : null;
  const badEl = badId ? document.getElementById(badId) : null;
  if (!goodEl && !badEl) return;
  if (goodId) {
    if (state.maps[goodId]) { state.maps[goodId].remove(); state.maps[goodId] = null; }
    clearContainer(goodId);
    const map = L.map(goodId, { zoomControl: false }).setView([49.5, 32], 6);
    state.maps[goodId] = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    buildMapPoints(mode).forEach(p => {
      const colors = ["#7fb069", "#c7a24f", "#ef4444"];
      L.circleMarker(p.coords, { radius: 8 + p.level * 2, color: colors[p.level - 1], fillColor: colors[p.level - 1], fillOpacity: 0.75, weight: 2 })
        .bindPopup(`${p.name}<br>Рівень: ${p.level}`).addTo(map);
    });
    setTimeout(() => map.invalidateSize(), 60);
  }
  if (badId) {
    if (state.maps[badId]) { state.maps[badId].remove(); state.maps[badId] = null; }
    clearContainer(badId);
    const map = L.map(badId, { zoomControl: false }).setView([49.5, 32], 6);
    state.maps[badId] = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    buildMapPoints(mode).forEach(p => {
      L.circleMarker(p.coords, { radius: 6, color: "#94a3b8", fillColor: "#94a3b8", fillOpacity: 0.45, weight: 1 }).addTo(map);
    });
    setTimeout(() => map.invalidateSize(), 60);
  }
}

// Теплокарта (good/bad)
function renderHeatMapPair() {
  const good = document.getElementById("mapGood2");
  const bad = document.getElementById("mapBad2");
  if (good) {
    good.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "heatgrid";
    const values = Array.from({ length: 36 }, () => rand(20, 95));
    values.forEach(v => {
      const cell = document.createElement("div");
      cell.className = "heat-cell";
      const color = v < 40 ? "#5f6f52" : v < 70 ? "#c7a24f" : "#ef4444";
      cell.style.background = color;
      cell.textContent = v;
      grid.appendChild(cell);
    });
    good.appendChild(grid);
    const legend = document.createElement("div");
    legend.className = "heat-legend";
    legend.innerHTML = '<span>Низько</span><div class="bar"></div><span>Високо</span>';
    good.appendChild(legend);
  }
  if (bad) {
    bad.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "heatgrid";
    Array.from({ length: 36 }).forEach(() => {
      const cell = document.createElement("div");
      cell.className = "heat-cell";
      cell.style.background = "rgba(148,163,184,0.2)";
      cell.textContent = "";
      grid.appendChild(cell);
    });
    bad.appendChild(grid);
    const note = document.createElement("div");
    note.className = "muted";
    note.style.marginTop = "8px";
    note.textContent = "Без шкали та підписів — важко зрозуміти значення.";
    bad.appendChild(note);
  }
}

function renderLongPair() {
  destroyChart("goodLong");
  destroyChart("badLong");
  const good = document.getElementById("goodLong");
  const bad = document.getElementById("badLong");
  const labels = ["Оперативний напрямок 1", "Оперативний напрямок 2", "Оперативний напрямок 3", "Оперативний напрямок 4", "Оперативний напрямок 5", "Оперативний напрямок 6"];
  const sorted = generateSeries(labels.length, 20, 100).map((v, i) => ({ v, label: labels[i] })).sort((a, b) => b.v - a.v);
  if (good) {
    state.charts.goodLong = new Chart(good, {
      type: "bar",
      data: { labels: sorted.map(i => i.label), datasets: [{ label: "Показник", data: sorted.map(i => i.v), backgroundColor: "#17c3b2cc" }] },
      options: { indexAxis: "y", plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, y: { ticks: { color: "#dce6ff" }, grid: { display: false } } } }
    });
  }
  if (bad) {
    state.charts.badLong = new Chart(bad, {
      type: "pie",
      data: { labels, datasets: [{ data: generateSeries(labels.length, 10, 60), backgroundColor: paletteBad.map(c => c + "cc") }] },
      options: { plugins: { legend: { position: "right", labels: { color: "#dce6ff" } } } }
    });
  }
}

function renderAreaPair() {
  destroyChart("goodArea");
  destroyChart("badRadar");
  const labels = ["Тиж 1", "Тиж 2", "Тиж 3", "Тиж 4", "Тиж 5", "Тиж 6"];
  const ds1 = generateSeries(labels.length, 15, 80);
  const ds2 = generateSeries(labels.length, 10, 60);
  const good = document.getElementById("goodArea");
  const bad = document.getElementById("badRadar");
  if (good) {
    state.charts.goodArea = new Chart(good, {
      type: "line",
      data: { labels, datasets: [
        { label: "Логістика", data: ds1, borderColor: "#38bdf8", backgroundColor: "rgba(56,189,248,0.2)", tension: 0.3, fill: true, stack: "area" },
        { label: "ППО", data: ds2, borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.2)", tension: 0.3, fill: true, stack: "area" },
      ]},
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, y: { stacked: true, ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  if (bad) {
    state.charts.badRadar = new Chart(bad, {
      type: "radar",
      data: { labels: Array.from({ length: 9 }, (_, i) => `Категорія ${i + 1}`), datasets: [{ label: "Перевантажена форма", data: generateSeries(9, 10, 80), backgroundColor: "rgba(245,158,11,0.25)", borderColor: "#f59e0b" }] },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } } }
    });
  }
}

function renderDualPair() {
  destroyChart("goodDual");
  destroyChart("badDual");
  const good = document.getElementById("goodDual");
  const bad = document.getElementById("badDual");
  const labels = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер"];
  const line = generateSeries(labels.length, 30, 110);
  const bars = generateSeries(labels.length, 10, 60);
  if (good) {
    state.charts.goodDual = new Chart(good, {
      data: { labels, datasets: [
        { type: "line", label: "Інтенсивність", data: line, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.15)", yAxisID: "y" },
        { type: "bar", label: "Супровід", data: bars, backgroundColor: "#f59e0bcc", yAxisID: "y1" }
      ]},
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: {
        y: { position: "left", ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } },
        y1: { position: "right", grid: { drawOnChartArea: false }, ticks: { color: "#dce6ff" } },
        x: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } },
      }}
    });
  }
  if (bad) {
    const avg = Math.round(line.reduce((a, b) => a + b) / line.length);
    state.charts.badDual = new Chart(bad, {
      type: "bar",
      data: { labels: ["Середній показник"], datasets: [{ data: [avg], backgroundColor: "#94a3b8cc", label: "Середнє" }] },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
}

function renderSmallMultiplesPair() {
  destroyChart("goodSmall");
  destroyChart("badSmall");
  const good = document.getElementById("goodSmall");
  const bad = document.getElementById("badSmall");
  const labels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7"];
  if (good) {
    state.charts.goodSmall = new Chart(good, {
      type: "line",
      data: { labels, datasets: [
        { label: "Напрямок A", data: generateSeries(labels.length, 20, 80), borderColor: "#c7a24f", tension: 0.25 },
        { label: "Напрямок B", data: generateSeries(labels.length, 15, 70), borderColor: "#7fb069", tension: 0.25 },
        { label: "Напрямок C", data: generateSeries(labels.length, 10, 60), borderColor: "#38bdf8", tension: 0.25 },
      ]},
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  if (bad) {
    const datasets = Array.from({ length: 8 }, (_, i) => ({
      label: `Серія ${i + 1}`,
      data: generateSeries(labels.length, 10, 100),
      borderColor: paletteBad[i % paletteBad.length],
      tension: 0.1,
    }));
    state.charts.badSmall = new Chart(bad, {
      type: "line",
      data: { labels, datasets },
      options: { plugins: { legend: { position: "bottom", labels: { color: "#dce6ff", boxWidth: 10 } } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
}

function renderBubblePair() {
  destroyChart("goodBubble");
  destroyChart("badBubble");
  const good = document.getElementById("goodBubble");
  const bad = document.getElementById("badBubble");
  if (good) {
    const pts = Array.from({ length: 15 }, () => ({ x: rand(5, 100), y: rand(10, 110), r: rand(5, 12) }));
    state.charts.goodBubble = new Chart(good, {
      type: "bubble",
      data: { datasets: [{ label: "Кореляція", data: pts, backgroundColor: "rgba(199,162,79,0.6)", borderColor: "#c7a24f" }] },
      options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
  if (bad) {
    state.charts.badBubble = new Chart(bad, {
      type: "bar",
      data: { labels: ["Середня кореляція"], datasets: [{ data: [rand(10, 90)], backgroundColor: "#94a3b8cc" }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
    });
  }
}

function initMiniCharts() {
  destroyChart("miniGood");
  destroyChart("miniBad");
  const goodEl = document.getElementById("miniGood");
  const badEl = document.getElementById("miniBad");
  if (!goodEl || !badEl) return;
  const labels = Array.from({ length: 14 }, (_, i) => `День ${i + 1}`);
  const series = generateSeries(labels.length, 20, 110);
  state.charts.miniGood = new Chart(goodEl, {
    type: "line",
    data: { labels, datasets: [{ label: "Детальна динаміка", data: series, borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.15)", fill: true, tension: 0.25 }] },
    options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
  });
  const coarse = ["Тиждень 1", "Тиждень 2", "Тиждень 3", "Тиждень 4"];
  const coarseData = [series.slice(0, 4), series.slice(4, 8), series.slice(8, 12), series.slice(12)].map(arr => Math.round(arr.reduce((a, b) => a + b) / arr.length));
  state.charts.miniBad = new Chart(badEl, {
    type: "bar",
    data: { labels: coarse, datasets: [{ label: "Надто грубо", data: coarseData, backgroundColor: "#f59e0bcc" }] },
    options: { plugins: { legend: { labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" }, grid: { display: false } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } }
  });
}

// Палітра
function renderPalette(mode) {
  const wrap = document.getElementById("paletteBars");
  if (!wrap) return;
  wrap.innerHTML = "";
  const values = generateSeries(5, 30, 95);
  const colors = mode === "good" ? paletteGood : paletteBad;
  values.forEach((v, i) => {
    const bar = document.createElement("div"); bar.className = "palette-bar";
    const track = document.createElement("div"); track.className = "track";
    const fill = document.createElement("div"); fill.className = "fill";
    fill.style.width = `${v}%`; fill.style.background = colors[i % colors.length];
    track.appendChild(fill);
    const label = document.createElement("div"); label.className = "label"; label.textContent = `Категорія ${i + 1} · ${v}%`;
    bar.append(track, label); wrap.appendChild(bar);
  });
}

// Дизайн блоки
function renderDesignBlocks() {
  const grid = document.querySelector(".design-grid");
  if (!grid) return;
  grid.querySelectorAll(".variant").forEach(v => {
    const group = v.dataset.group;
    const isGood = v.classList.contains("good");
    const showGood = group === "structure" ? state.structureMode === "good" : state.designMode === "balanced";
    v.classList.toggle("hidden", showGood ? !isGood : isGood);
  });
}

// Алгоритм
function initAlgorithm() {
  const stepsWrap = document.getElementById("algoSteps");
  const preview = document.getElementById("algoPreview");
  const algoChartWrap = document.querySelector(".algo-chart");
  if (!stepsWrap || !preview) return;
  const steps = [
    { id: "question", title: "1. Запитання", text: "Сформулюйте, що саме показуємо: порівняння, динаміку, структуру, розподіл чи простір." },
    { id: "type", title: "2. Тип даних", text: "Категорії/час/частки/координати/розподіли — від цього залежить форма." },
    { id: "shape", title: "3. Форма", text: "Обираємо графік з мінімальним когнітивним шумом." },
    { id: "color", title: "4. Кольори/легенда", text: "4–5 кольорів, контраст, підписи ключових точок." },
    { id: "refine", title: "5. Уточнення", text: "Прибираємо 3D, тіні, зайві сітки; додаємо анотації та вирівнюємо шкали." },
  ];
  const titleEl = preview.querySelector(".algo-title");
  const textEl = preview.querySelector(".algo-text");
  const visualEl = preview.querySelector(".algo-visual");

  function renderAlgoChart(stepId) {
    if (!algoChartWrap) return;
    algoChartWrap.innerHTML = "";
    if (state.algoChart) { state.algoChart.destroy(); state.algoChart = null; }
    if (stepId === "question") {
      const box = document.createElement("div");
      box.className = "algo-card";
      box.innerHTML = `<div class="badge">Назва графіка</div><div class="h1">"Ефективність напрямків"</div><div class="p">Сформульована мета відображається у заголовку.</div>`;
      algoChartWrap.appendChild(box); return;
    }
    if (stepId === "type") {
      const table = document.createElement("table");
      table.className = "algo-table";
      table.innerHTML = `<tr><th>Поле</th><th>Формат</th></tr><tr><td>Дата</td><td>Часова шкала</td></tr><tr><td>Категорія</td><td>6 напрямків</td></tr><tr><td>Значення</td><td>Цілі числа</td></tr>`;
      algoChartWrap.appendChild(table); return;
    }
    const canvas = document.createElement("canvas"); algoChartWrap.appendChild(canvas);
    if (stepId === "shape") {
      const data = [42, 45, 40, 38, 44];
      state.algoChart = new Chart(canvas, { type: "bar", data: { labels: ["A", "B", "C", "D", "E"], datasets: [{ data, backgroundColor: "#38bdf8" }] }, options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } } });
    } else if (stepId === "color") {
      const data = [20, 32, 28, 25, 30];
      state.algoChart = new Chart(canvas, { type: "bar", data: { labels: ["A", "B", "C", "D", "E"], datasets: [{ label: "Легенда", data, backgroundColor: paletteGood.map(c => c + "cc") }] }, options: { plugins: { legend: { position: "bottom", labels: { color: "#dce6ff" } } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } } });
    } else if (stepId === "refine") {
      const labels = ["T1", "T2", "T3", "T4", "T5"];
      const data = generateSeries(labels.length, 20, 80);
      const maxVal = Math.max(...data);
      const maxIdx = data.indexOf(maxVal);
      state.algoChart = new Chart(canvas, { type: "bar", data: { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => i === maxIdx ? "#ef4444cc" : "#7fb069cc"), borderColor: labels.map((_, i) => i === maxIdx ? "#ef4444" : "#7fb069"), borderWidth: 1.5 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw } } }, scales: { x: { ticks: { color: "#dce6ff" } }, y: { ticks: { color: "#dce6ff" }, grid: { color: "rgba(255,255,255,0.08)" } } } } });
    }
  }

  function setStep(id) {
    const step = steps.find(s => s.id === id);
    if (!step) return;
    titleEl.textContent = step.title;
    textEl.textContent = step.text;
    const visuals = {
      question: `<div class="algo-card"><div class="badge">Запитання</div><div class="h1">Що треба показати?</div><div class="p">Порівняння? Динаміка? Структура? Простір?</div></div>`,
      type: `<div class="algo-card"><div class="badge">Тип даних</div><div class="h1">Категорії + час</div><div class="p">Рекомендація: лінія/бар. Координати — карта.</div></div>`,
      shape: `<div class="algo-card"><div class="badge">Форма</div><div class="shape-row"><div class="shape good">Бар</div><div class="shape good">Лінія</div><div class="shape muted">Сектор</div></div><div class="p">Підсвічено рекомендовану форму; інші — тьмяні.</div></div>`,
      color: `<div class="algo-card"><div class="badge">Кольори/легенда</div><div class="legend-row"><span class="chip good">4-5 кольорів</span><span class="chip good">Контраст</span><span class="chip good">Підписи</span></div><div class="p">Легенда поруч, кольори узгоджені з фоном.</div></div>`,
      refine: `<div class="algo-card"><div class="badge">Уточнення</div><div class="p">Прибрали 3D/тіні/зайві сітки. Додали анотації й вирівняли осі.</div><div class="annot">Пік • позначено коментарем</div></div>`
    };
    visualEl.innerHTML = visuals[id] || "";
    stepsWrap.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.step === id));
    renderAlgoChart(id);
  }

  stepsWrap.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => setStep(btn.dataset.step)));
  setStep(steps[0].id);
}

// Події
function wireButtons() {
  const refresh = document.getElementById("refreshCharts");
  if (refresh) refresh.addEventListener("click", () => {
    initGoodBadCharts();
    renderPalette(state.paletteMode);
    renderComparePair();
    renderHeatPair();
    renderScatterPair();
    renderTreemapPair();
    renderMapPair("mapGood1", "mapBad1");
  });

  const refreshMini = document.getElementById("refreshMini");
  if (refreshMini) refreshMini.addEventListener("click", () => initMiniCharts());

  const refreshCharts2 = document.getElementById("refreshCharts2");
  if (refreshCharts2) refreshCharts2.addEventListener("click", () => {
    renderLongPair();
    renderAreaPair();
    renderDualPair();
    renderHeatMapPair();
    renderSmallMultiplesPair();
    renderBubblePair();
    renderPalette(state.paletteMode);
    renderDesignBlocks();
    initAlgorithm();
  });

  const designBalanced = document.getElementById("designBalanced");
  const designOver = document.getElementById("designOver");
  if (designBalanced && designOver) {
    designBalanced.addEventListener("click", () => { state.designMode = "balanced"; designBalanced.classList.add("active"); designOver.classList.remove("active"); renderDesignBlocks(); initAlgorithm(); });
    designOver.addEventListener("click", () => { state.designMode = "overloaded"; designOver.classList.add("active"); designBalanced.classList.remove("active"); renderDesignBlocks(); });
  }

  const paletteGoodBtn = document.getElementById("paletteGood");
  const paletteBadBtn = document.getElementById("paletteBad");
  if (paletteGoodBtn && paletteBadBtn) {
    paletteGoodBtn.addEventListener("click", () => {
      state.paletteMode = "good";
      paletteGoodBtn.classList.add("active");
      paletteBadBtn.classList.remove("active");
      renderPalette(state.paletteMode);
    });
    paletteBadBtn.addEventListener("click", () => {
      state.paletteMode = "bad";
      paletteBadBtn.classList.add("active");
      paletteGoodBtn.classList.remove("active");
      renderPalette(state.paletteMode);
    });
  }

  const structureGood = document.getElementById("structureGood");
  const structureBad = document.getElementById("structureBad");
  if (structureGood && structureBad) {
    structureGood.addEventListener("click", () => { state.structureMode = "good"; structureGood.classList.add("active"); structureBad.classList.remove("active"); renderDesignBlocks(); });
    structureBad.addEventListener("click", () => { state.structureMode = "bad"; structureBad.classList.add("active"); structureGood.classList.remove("active"); renderDesignBlocks(); });
  }
}

// Init on load
document.addEventListener("DOMContentLoaded", () => {
  initQuestionGuide();
  initGoodBadCharts();
  renderPalette(state.paletteMode);
  initMiniCharts();
  wireButtons();
  renderComparePair();
  renderHeatPair();
  renderLongPair();
  renderAreaPair();
  renderDualPair();
  renderScatterPair();
  renderTreemapPair();
  renderMapPair("mapGood1", "mapBad1");
  renderHeatMapPair();
  renderSmallMultiplesPair();
  renderBubblePair();
  renderDesignBlocks();
  initAlgorithm();
});
