const tableConfig = [
  ["teamPerformance", "Team seasons"],
  ["battingCareer", "Career batting"],
  ["bowlingCareer", "Career bowling"],
  ["seasonRuns", "Season runs"],
  ["seasonWickets", "Season wickets"],
  ["highestScores", "Highest scores"],
  ["highestStrikeRateInnings", "High SR innings"],
  ["bestBowlingInnings", "Best bowling"],
  ["captains", "Captains"],
  ["keepingCareer", "Wicketkeeping"],
  ["fieldingCareer", "Fielding"],
  ["partnershipsByRuns", "Partnerships"],
  ["partnershipsByWicket", "Partnership by wicket"],
  ["mostMatches", "Most matches"]
];

let appData;
let activeTable = "battingCareer";
let sortState = { key: "runs", dir: "desc" };
let page = 1;
const embeddedTableState = new Map();
const scatterPoints = new WeakMap();
const quadrantBoxes = new WeakMap();
const playerLabelBoxes = new WeakMap();
let quadrantDrag = null;
let playerLabelDrag = null;
let lastViewportKey = "";

const seasonResults = {
  2008: "League stage",
  2009: "Finalist",
  2010: "Playoffs",
  2011: "Finalist",
  2012: "League stage",
  2013: "League stage",
  2014: "League stage",
  2015: "Playoffs",
  2016: "Finalist",
  2017: "League stage",
  2018: "League stage",
  2019: "League stage",
  2020: "Playoffs",
  2021: "Playoffs",
  2022: "Playoffs",
  2023: "League stage",
  2024: "Playoffs",
  2025: "Champion"
};

const defaultSorts = {
  teamPerformance: { key: "season", dir: "asc" },
  battingCareer: { key: "runs", dir: "desc" },
  bowlingCareer: { key: "wickets", dir: "desc" },
  seasonRuns: { key: "runs", dir: "desc" },
  seasonWickets: { key: "wickets", dir: "desc" },
  highestScores: { key: "runs", dir: "desc" },
  highestStrikeRateInnings: { key: "strikeRate", dir: "desc" },
  bestBowlingInnings: { key: "wickets", dir: "desc" },
  captains: { key: "winPct", dir: "desc" },
  keepingCareer: { key: "dismissals", dir: "desc" },
  fieldingCareer: { key: "catches", dir: "desc" },
  partnershipsByRuns: { key: "runs", dir: "desc" },
  partnershipsByWicket: { key: "runs", dir: "desc" },
  mostMatches: { key: "matches", dir: "desc" }
};

const tableDescriptions = {
  teamPerformance: "Season-by-season RCB team results.",
  battingCareer: "Career batting records for all RCB players, sorted by runs by default.",
  bowlingCareer: "Career bowling records for all RCB players, sorted by wickets by default.",
  seasonRuns: "Best batting seasons, sorted by runs.",
  seasonWickets: "Best bowling seasons, sorted by wickets.",
  highestScores: "Highest individual innings for RCB.",
  highestStrikeRateInnings: "Fastest RCB innings by strike rate.",
  bestBowlingInnings: "Best RCB bowling figures in an innings.",
  captains: "RCB captaincy records.",
  keepingCareer: "Wicketkeeping dismissals for RCB.",
  fieldingCareer: "Fielding catches for RCB.",
  partnershipsByRuns: "Highest RCB partnerships by runs.",
  partnershipsByWicket: "Highest RCB partnerships by wicket.",
  mostMatches: "Most appearances for RCB."
};

const selectedXII = [
  { slot: 1, player: "Chris Gayle", role: "Overseas opener", foreign: true, type: "batter", reason: "Unmatched RCB batting ceiling, headlined by 175* and a 154-plus strike rate." },
  { slot: 2, player: "Virat Kohli", role: "Indian opener", foreign: false, type: "batter", reason: "The franchise run king and the owner of RCB's greatest batting season." },
  { slot: 3, player: "Rajat Patidar", role: "Indian top-order batter", foreign: false, captain: true, type: "batter", reason: "Title-winning captain, high-tempo Indian top-order option and playoff hundred maker." },
  { slot: 4, player: "AB de Villiers", role: "Overseas middle-order batter", foreign: true, type: "batter", reason: "Elite average, elite strike rate and RCB's best middle-order match-winner." },
  { slot: 5, player: "Glenn Maxwell", role: "Overseas batting all-rounder", foreign: true, type: "allrounder", reason: "Middle-overs acceleration plus a useful spin option keeps the XI flexible." },
  { slot: 6, player: "Dinesh Karthik", role: "Indian wicketkeeper finisher", foreign: false, type: "keeper", reason: "Best Indian keeper-finisher fit and a rare specialist death-overs batting role." },
  { slot: 7, player: "Krunal Pandya", role: "Indian spin all-rounder", foreign: false, type: "allrounder", reason: "Title-season weight, left-hand balance and stronger wicket-taking contribution." },
  { slot: 8, player: "Anil Kumble", role: "Indian leg-spinner", foreign: false, type: "bowler", reason: "Control, leadership and the 5/5 spell give him a timeless RCB case." },
  { slot: 9, player: "Yuzvendra Chahal", role: "Indian wrist-spinner", foreign: false, type: "bowler", reason: "RCB's leading wicket-taker and best middle-overs wicket source." },
  { slot: 10, player: "Josh Hazlewood", role: "Overseas fast bowler", foreign: true, type: "bowler", reason: "Longer RCB body of work, control profile and title-era relevance." },
  { slot: 11, player: "Bhuvneshwar Kumar", role: "Indian swing bowler", foreign: false, type: "bowler", reason: "New-ball craft, later-era context and title-season value." },
  { slot: 12, player: "Harshal Patel", role: "Impact substitute", foreign: false, type: "bowler", reason: "Record 32-wicket season and condition-specific death bowling value." }
];

const reservePlayers = ["Faf du Plessis", "Jacques Kallis", "Dale Steyn", "Wanindu Hasaranga", "Mitchell Starc", "Mohammed Siraj", "KL Rahul", "Devdutt Padikkal", "Phil Salt", "Jitesh Sharma", "Yash Dayal", "Tim David", "Romario Shepherd", "Washington Sundar"];

const battingLabelPlayers = new Set(["Virat Kohli", "AB de Villiers", "Chris Gayle", "Rajat Patidar", "Faf du Plessis", "Glenn Maxwell", "Dinesh Karthik", "Tim David", "Phil Salt"]);
const bowlingLabelPlayers = new Set(["Yuzvendra Chahal", "Harshal Patel", "Mohammed Siraj", "Vinay Kumar", "Josh Hazlewood", "Anil Kumble", "Mitchell Starc", "Bhuvneshwar Kumar", "Wanindu Hasaranga", "Krunal Pandya"]);
const battingLeaderboardMinRuns = 100;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function format(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1900 && value <= 2100) return String(value);
  if (typeof value === "number") return value.toLocaleString();
  return value ?? "";
}

function normalizePlayerName(name) {
  return String(name ?? "").replace(/\s+/g, " ").trim();
}

function compactNumber(value, decimals = 2) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(decimals).replace(/\.?0+$/, "");
  return value;
}

function formatDateTime(value) {
  const date = new Date(value);
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

function showToast(message, kind = "ok") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}

function mergePlayerRecords(...tables) {
  const players = new Map();
  const sourceNames = ["batting", "bowling", "fielding", "keeping", "matches"];

  tables.forEach((table, tableIndex) => {
    const source = sourceNames[tableIndex] || `table${tableIndex}`;
    for (const row of table || []) {
      const name = normalizePlayerName(row.player || row.Player);
      if (!name) continue;
      const existing = players.get(name) || { player: name };
      players.set(name, { ...existing, [source]: row, player: name });
    }
  });

  return [...players.values()];
}

function winPct(row) {
  return row.matches ? Number(((row.won / row.matches) * 100).toFixed(1)) : 0;
}

function shortSeasonLabel(season) {
  return String(season).slice(-2);
}

function getPaddedDomain(values, paddingRatio = 0.08, fallback = [0, 1]) {
  const nums = values.filter(Number.isFinite);
  if (!nums.length) return fallback;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const pad = (max - min) * paddingRatio || 5;
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

function quadrantStorageKey(chartId) {
  return `rcbStatPack.quadrants.${chartId}`;
}

function loadQuadrantPositions(chartId) {
  try {
    return JSON.parse(localStorage.getItem(quadrantStorageKey(chartId)) || "{}");
  } catch {
    return {};
  }
}

function saveQuadrantPosition(chartId, key, position) {
  const positions = loadQuadrantPositions(chartId);
  positions[key] = position;
  localStorage.setItem(quadrantStorageKey(chartId), JSON.stringify(positions));
}

function playerLabelStorageKey(chartId) {
  return `rcbStatPack.playerLabels.${chartId}`;
}

function loadPlayerLabelPositions(chartId) {
  try {
    return JSON.parse(localStorage.getItem(playerLabelStorageKey(chartId)) || "{}");
  } catch {
    return {};
  }
}

function savePlayerLabelPosition(chartId, player, offset) {
  const positions = loadPlayerLabelPositions(chartId);
  positions[player] = offset;
  localStorage.setItem(playerLabelStorageKey(chartId), JSON.stringify(positions));
}

function hiddenPlayersStorageKey(chartId) {
  return `rcbStatPack.hiddenPlayers.${chartId}`;
}

function loadHiddenPlayers(chartId) {
  try {
    return new Set(JSON.parse(localStorage.getItem(hiddenPlayersStorageKey(chartId)) || "[]"));
  } catch {
    return new Set();
  }
}

function hideScatterPlayer(chartId, player) {
  const hidden = loadHiddenPlayers(chartId);
  hidden.add(player);
  localStorage.setItem(hiddenPlayersStorageKey(chartId), JSON.stringify([...hidden]));
}

function clearHiddenScatterPlayers(chartId) {
  localStorage.removeItem(hiddenPlayersStorageKey(chartId));
}

function isScatterPlayerHidden(chartId, player) {
  return loadHiddenPlayers(chartId).has(player);
}

function impactScore(player) {
  const batting = player.batting;
  const bowling = player.bowling;
  const fielding = player.fielding;
  const keeping = player.keeping;
  const match = player.matches;
  const batScore = batting ? (batting.runs || 0) / 110 + (batting.strikeRate || 0) / 4 + (batting.average || 0) / 2 : 0;
  const bowlScore = bowling ? (bowling.wickets || 0) * 0.85 + Math.max(0, 10 - (bowling.economy || 10)) * 6 + Math.max(0, 24 - (bowling.strikeRate || 24)) * 2 : 0;
  const fieldScore = (fielding?.catches || 0) * 0.12 + (keeping?.dismissals || 0) * 0.2;
  const service = match ? Math.min(match.matches / 6, 35) : 0;
  return Math.max(0, Math.round(batScore + bowlScore + fieldScore + service));
}

function setupCanvas(canvas) {
  if (!canvas || !canvas.closest(".view-panel.active")) return null;
  if (!canvas.dataset.cssHeight) canvas.dataset.cssHeight = canvas.getAttribute("height") || "420";
  const cssHeight = Number(canvas.dataset.cssHeight);
  canvas.style.setProperty("height", `${cssHeight}px`, "important");
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return null;
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = Math.max(320, Math.floor(rect.width));
  canvas.width = Math.floor(cssWidth * ratio);
  canvas.height = Math.floor(cssHeight * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.font = "12px Inter, sans-serif";
  return { ctx, width: cssWidth, height: cssHeight };
}

function drawBarChart(canvas, labels, values, options = {}) {
  if (!canvas) return;
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = {
    left: 54,
    right: 24,
    top: 24,
    bottom: 156
  };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const max = Math.max(...values, 1) * 1.12;

  ctx.strokeStyle = "#e4ddd8";
  ctx.fillStyle = "#6d6260";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + chartH - (chartH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(Math.round((max * i) / 4), pad.left - 8, y + 4);
  }

  const gap = 8;
  const barW = Math.max(10, chartW / values.length - gap);
  values.forEach((value, index) => {
    const barH = (value / max) * chartH;
    const x = pad.left + index * (barW + gap);
    const y = pad.top + chartH - barH;
    ctx.fillStyle = options.colors?.[index] || options.colors?.[index % (options.colors?.length || 1)] || "#231f20";
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#171313";
    ctx.textAlign = "center";
    if (options.values !== false) ctx.fillText(String(value), x + barW / 2, y - 6);
    ctx.fillStyle = "#4e4644";
    if (options.horizontalLabels) {
      ctx.textAlign = "center";
      ctx.fillText(labels[index], x + barW / 2, pad.top + chartH + 28);
    } else {
      ctx.save();
      ctx.translate(x + barW / 2, pad.top + chartH + 92);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "right";
      ctx.fillText(labels[index], 0, 0);
      ctx.restore();
    }
  });
}

function drawHorizontalBarChart(canvas, labels, values, options = {}) {
  if (!canvas) return;
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = {
    left: 170,
    right: 40,
    top: 24,
    bottom: 30
  };
  const chartW = width - pad.left - pad.right;
  const rowH = (height - pad.top - pad.bottom) / Math.max(1, labels.length);
  const max = Math.max(...values, 1) * 1.08;
  ctx.font = "12px Inter, sans-serif";
  labels.forEach((label, index) => {
    const y = pad.top + index * rowH + rowH * 0.18;
    const barH = Math.max(8, rowH * 0.55);
    const barW = (values[index] / max) * chartW;
    ctx.fillStyle = "#4e4644";
    ctx.textAlign = "right";
    ctx.fillText(label, pad.left - 10, y + barH * 0.72);
    ctx.fillStyle = options.colors?.[index] || options.colors?.[index % (options.colors?.length || 1)] || "#231f20";
    ctx.fillRect(pad.left, y, barW, barH);
    ctx.fillStyle = "#171313";
    ctx.textAlign = "left";
    ctx.fillText(String(values[index]), pad.left + barW + 6, y + barH * 0.72);
  });
}

function drawScatter(canvas, rows, options) {
  if (!canvas) return;
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  if (!rows.length) {
    ctx.fillStyle = "#6d6260";
    ctx.textAlign = "center";
    ctx.fillText("No players match this minimum sample.", width / 2, height / 2);
    return;
  }
  const pad = {
    left: 72,
    right: 32,
    top: 34,
    bottom: 70
  };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const xValues = rows.map(options.x);
  const yValues = rows.map(options.y);
  const sizeValues = rows.map(options.size);
  const xMin = options.xMin ?? Math.min(...xValues);
  const xMax = options.xMax ?? Math.max(...xValues);
  const yMin = options.yMin ?? Math.min(...yValues);
  const yMax = options.yMax ?? Math.max(...yValues);

  ctx.strokeStyle = "#ded6d1";
  ctx.fillStyle = "#6d6260";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const x = pad.left + (chartW * i) / 4;
    const y = pad.top + (chartH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + chartH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillText((yMax - ((yMax - yMin) * i) / 4).toFixed(0), pad.left - 10, y + 4);
  }

  const xMedian = median(xValues);
  const yMedian = median(yValues);
  const medianX = pad.left + ((xMedian - xMin) / Math.max(1, xMax - xMin)) * chartW;
  const medianY = pad.top + chartH - ((yMedian - yMin) / Math.max(1, yMax - yMin)) * chartH;
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "rgba(35,31,32,.32)";
  ctx.beginPath();
  ctx.moveTo(medianX, pad.top);
  ctx.lineTo(medianX, pad.top + chartH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad.left, medianY);
  ctx.lineTo(pad.left + chartW, medianY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(35,31,32,.62)";
  ctx.textAlign = "left";
  if (options.betterLabel && !options.quadrants) ctx.fillText(options.betterLabel, pad.left + 8, pad.top + chartH - 8);
  if (options.quadrants) {
    ctx.save();
    ctx.font = "700 12px Inter, sans-serif";
    const labels = options.quadrants;
    const boxes = [];
    const savedPositions = loadQuadrantPositions(options.chartId || canvas.id);
    const defaultPositions = {
      topLeft: { x: pad.left + 10, y: pad.top + 24 },
      bottomLeft: { x: pad.left + 10, y: pad.top + chartH - 10 },
      topRight: { x: pad.left + chartW - 10, y: pad.top + 24 },
      bottomRight: { x: pad.left + chartW - 10, y: pad.top + chartH - 10 }
    };
    const positionFor = (key) => {
      const saved = savedPositions[key];
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        return {
          x: pad.left + saved.x * chartW,
          y: pad.top + saved.y * chartH
        };
      }
      return defaultPositions[key];
    };
    const drawQuadrantLabel = (key, text) => {
      if (!text) return null;
      const { x, y } = positionFor(key);
      const align = x > pad.left + chartW / 2 ? "right" : "left";
      const paddingX = 8;
      const paddingY = 5;
      const textW = ctx.measureText(text).width;
      const boxW = textW + paddingX * 2;
      const boxH = 22;
      const boxX = align === "right" ? x - boxW : x;
      const boxY = y - boxH + paddingY;
      ctx.fillStyle = "rgba(247,243,234,.92)";
      ctx.strokeStyle = "rgba(200,16,46,.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#231f20";
      ctx.textAlign = align;
      ctx.fillText(text, x + (align === "right" ? -paddingX : paddingX), y);
      return { key, text, x: boxX, y: boxY, w: boxW, h: boxH, anchorX: x, anchorY: y, chart: { left: pad.left, top: pad.top, width: chartW, height: chartH } };
    };
    ["topLeft", "bottomLeft", "topRight", "bottomRight"].forEach((key) => {
      const box = drawQuadrantLabel(key, labels[key]);
      if (box) boxes.push(box);
    });
    quadrantBoxes.set(canvas, boxes);
    canvas.dataset.quadrantBoxes = JSON.stringify(boxes.map(({ key, x, y, w, h, anchorX, anchorY }) => ({ key, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), anchorX: Math.round(anchorX), anchorY: Math.round(anchorY) })));
    ctx.restore();
  } else {
    quadrantBoxes.delete(canvas);
    delete canvas.dataset.quadrantBoxes;
  }

  const points = [];
  const labelBoxes = [];
  const playerBoxes = [];
  const savedLabelPositions = loadPlayerLabelPositions(options.chartId || canvas.id);
  let labelsDrawn = 0;
  rows.forEach((row, index) => {
    const xRatio = Math.min(1, Math.max(0, (options.x(row) - xMin) / Math.max(1, xMax - xMin)));
    const yRatio = Math.min(1, Math.max(0, (options.y(row) - yMin) / Math.max(1, yMax - yMin)));
    const x = pad.left + xRatio * chartW;
    const y = pad.top + chartH - yRatio * chartH;
    const radius = Math.max(7, Math.min(22, options.size(row) / Math.max(...sizeValues) * 22));
    ctx.beginPath();
    ctx.fillStyle = options.color?.(row, index) || "#231f20";
    ctx.globalAlpha = 0.86;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    points.push({ x, y, radius, row, tooltip: options.tooltip?.(row) });
    if (shouldLabel(row, index, options)) {
      const label = row.player;
      const allOffsets = [[6, 4], [6, -8], [-6, 4], [-6, -8], [12, 12], [-12, 12], [12, -14], [-12, -14]];
      const [offsetX, offsetY] = options.labelMode === "all" ? allOffsets[index % allOffsets.length] : [4, 4];
      const savedOffset = savedLabelPositions[row.player];
      const hasSavedOffset = savedOffset && Number.isFinite(savedOffset.dx) && Number.isFinite(savedOffset.dy);
      const alignRight = hasSavedOffset ? savedOffset.dx < 0 : options.labelMode === "all" && (offsetX < 0 || x > pad.left + chartW * 0.72);
      ctx.save();
      ctx.font = options.labelMode === "all" ? "10px Inter, sans-serif" : "12px Inter, sans-serif";
      const labelW = ctx.measureText(label).width;
      let labelX = hasSavedOffset ? x + savedOffset.dx : alignRight ? x - radius - Math.abs(offsetX) : x + radius + Math.abs(offsetX);
      const labelY = hasSavedOffset ? y + savedOffset.dy : Math.max(pad.top + 12, Math.min(pad.top + chartH - 4, y + offsetY));
      if (!hasSavedOffset && !alignRight && labelX + labelW > pad.left + chartW) labelX = x - radius - Math.abs(offsetX);
      if (!hasSavedOffset && alignRight && labelX - labelW < pad.left) labelX = x + radius + Math.abs(offsetX);
      const box = { x: alignRight ? labelX - labelW : labelX, y: labelY - 12, w: labelW, h: 16 };
      const collides = labelBoxes.some((other) => !(box.x > other.x + other.w || box.x + box.w < other.x || box.y > other.y + other.h || box.y + box.h < other.y));
      if (collides && options.labelMode !== "all") {
        ctx.restore();
        return;
      }
      labelBoxes.push(box);
      playerBoxes.push({ ...box, player: row.player, pointX: x, pointY: y, labelX, labelY });
      ctx.fillStyle = "#171313";
      ctx.textAlign = alignRight ? "right" : "left";
      ctx.fillText(label, labelX, labelY);
      labelsDrawn += 1;
      ctx.restore();
    }
  });
  scatterPoints.set(canvas, points);
  playerLabelBoxes.set(canvas, playerBoxes);
  canvas.dataset.points = String(points.length);
  canvas.dataset.labelsDrawn = String(labelsDrawn);
  canvas.dataset.scatterPointBoxes = JSON.stringify(points.map(({ row, x, y, radius }) => ({ player: row.player, x: Math.round(x), y: Math.round(y), radius: Math.round(radius) })));
  canvas.dataset.playerLabelBoxes = JSON.stringify(playerBoxes.map(({ player, x, y, w, h }) => ({ player, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) })));

  ctx.fillStyle = "#6d6260";
  ctx.textAlign = "center";
  ctx.fillText(options.xLabel, pad.left + chartW / 2, height - 18);
  ctx.textAlign = "center";
  for (let i = 0; i <= 4; i += 1) {
    const x = pad.left + (chartW * i) / 4;
    const value = xMin + ((xMax - xMin) * i) / 4;
    ctx.fillText(value.toFixed(1).replace(".0", ""), x, pad.top + chartH + 24);
  }
  ctx.save();
  ctx.translate(18, pad.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(options.yLabel, 0, 0);
  ctx.restore();
}

function median(values) {
  const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!nums.length) return 0;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function shouldLabel(row, index, options) {
  if (options.labelMode === "none") return false;
  if (options.labelMode === "all") return true;
  if (options.labelPlayers?.has(row.player)) return true;
  return index < (options.labelCount || 0);
}

function seasonColors(rows) {
  return rows.map((row) => {
    const result = seasonResults[row.season] || "League stage";
    if (result === "Champion") return "#d4a72c";
    if (result === "Finalist") return "#244f8f";
    if (result === "Playoffs") return "#137a43";
    return "#231f20";
  });
}

function topBarColors(rows, selectedName) {
  return rows.map((row, index) => {
    if (row.player === selectedName) return "#c8102e";
    return "#231f20";
  });
}

function renderKpis() {
  const seasons = appData.teamPerformance;
  const playoffRows = seasons.filter((row) => {
    const result = String(row.result).toLowerCase();
    return result.includes("champion") || result.includes("runner") || result.includes("playoff") || result.includes("place");
  });
  const finalistRows = seasons.filter((row) => /runner|champion/i.test(row.result));
  const bestBatter = [...appData.battingCareer].sort((a, b) => b.runs - a.runs)[0];
  const bestBowler = [...appData.bowlingCareer].sort((a, b) => b.wickets - a.wickets)[0];
  const bestSeason = [...appData.seasonRuns].sort((a, b) => b.runs - a.runs)[0];
  $("#kpiGrid").innerHTML = [
    ["Team Milestones", "1 title · 4 finals", `Champion: 2025<br>Finals: ${finalistRows.map((row) => row.season).join(", ")}<br>Playoff seasons: ${playoffRows.length}`],
    ["Highest Runs", bestBatter.player, `${format(bestBatter.runs)} runs · ${bestBatter.strikeRate} SR`],
    ["Most Wickets", bestBowler.player, `${bestBowler.wickets} wickets · ${bestBowler.economy} economy`],
    ["Top Run Season", `${bestSeason.player}, ${bestSeason.season}`, `${bestSeason.runs} runs · ${bestSeason.average} avg · ${bestSeason.strikeRate} SR`]
  ].map(([label, value, detail]) => `<div class="kpi"><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`).join("");
}

function renderCharts() {
  const seasonRows = appData.teamPerformance.map((row) => ({ ...row, winPct: winPct(row) }));
  const metric = $("#seasonMetric")?.value || "winPct";
  drawBarChart($("#seasonChart"), seasonRows.map((row) => shortSeasonLabel(row.season)), seasonRows.map((row) => row[metric]), { colors: seasonColors(seasonRows), horizontalLabels: true });
  const largeMetric = $("#seasonMetricLarge")?.value || metric;
  drawBarChart($("#seasonLargeChart"), seasonRows.map((row) => shortSeasonLabel(row.season)), seasonRows.map((row) => row[largeMetric]), { colors: seasonColors(seasonRows), horizontalLabels: true });

  const leaderMetric = $("#leaderMetric")?.value || "runs";
  if (leaderMetric === "wickets") {
    const rows = [...appData.bowlingCareer].sort((a, b) => b.wickets - a.wickets).slice(0, 12);
    drawHorizontalBarChart($("#leaderChart"), rows.map((row) => row.player), rows.map((row) => row.wickets), { colors: topBarColors(rows) });
  } else if (leaderMetric === "matches") {
    const rows = [...appData.mostMatches].sort((a, b) => b.matches - a.matches).slice(0, 12);
    drawHorizontalBarChart($("#leaderChart"), rows.map((row) => row.player), rows.map((row) => row.matches), { colors: topBarColors(rows) });
  } else if (leaderMetric === "strikeRate") {
    const rows = [...appData.battingCareer].filter((row) => row.runs >= battingLeaderboardMinRuns).sort((a, b) => b.strikeRate - a.strikeRate).slice(0, 12);
    drawHorizontalBarChart($("#leaderChart"), rows.map((row) => row.player), rows.map((row) => row.strikeRate), { colors: topBarColors(rows) });
  } else if (leaderMetric === "average") {
    const rows = [...appData.battingCareer].filter((row) => row.runs >= battingLeaderboardMinRuns && row.average).sort((a, b) => b.average - a.average).slice(0, 12);
    drawHorizontalBarChart($("#leaderChart"), rows.map((row) => row.player), rows.map((row) => row.average), { colors: topBarColors(rows) });
  } else {
    const rows = [...appData.battingCareer].sort((a, b) => b.runs - a.runs).slice(0, 12);
    drawHorizontalBarChart($("#leaderChart"), rows.map((row) => row.player), rows.map((row) => row.runs), { colors: topBarColors(rows) });
  }

  const minRuns = Number($("#minRuns")?.value || 0);
  const battingRows = appData.battingCareer.filter((row) => row.runs >= minRuns && row.average && row.strikeRate && !isScatterPlayerHidden("battingScatter", row.player));
  const avgValues = battingRows.map((row) => row.average);
  const srValues = battingRows.map((row) => row.strikeRate);
  const [batXMin, batXMax] = getPaddedDomain(avgValues, 0.18, [0, 60]);
  const [batYMin, batYMax] = getPaddedDomain(srValues, 0.18, [80, 225]);
  const battingLabelMode = $("#battingLabelMode")?.value || "top";
  drawScatter($("#battingScatter"), battingRows, {
    x: (row) => row.average,
    y: (row) => row.strikeRate,
    size: (row) => row.runs,
    chartId: "battingScatter",
    xMin: Math.max(0, batXMin),
    xMax: batXMax,
    yMin: Math.max(0, batYMin),
    yMax: batYMax,
    xLabel: "Average",
    yLabel: "Strike rate",
    labelMode: battingLabelMode,
    labelPlayers: battingLabelPlayers,
    quadrants: {
      topLeft: "Fast, volatile",
      topRight: "Elite engines",
      bottomLeft: "Low-output anchors",
      bottomRight: "Efficient anchors"
    },
    color: (row) => selectedXII.some((pick) => pick.player === row.player) ? "#c8102e" : "#231f20",
    tooltip: (row) => `<strong>${row.player}</strong>${format(row.runs)} runs<br>${compactNumber(row.average)} average<br>${compactNumber(row.strikeRate)} SR<br>${row.matches} matches`
  });
  const topRuns = [...battingRows].sort((a, b) => b.runs - a.runs).slice(0, 12);
  drawHorizontalBarChart($("#battingRunsChart"), topRuns.map((row) => row.player), topRuns.map((row) => row.runs), { colors: topBarColors(topRuns) });
  const topSr = [...battingRows].sort((a, b) => b.strikeRate - a.strikeRate).slice(0, 12);
  drawHorizontalBarChart($("#battingSrChart"), topSr.map((row) => row.player), topSr.map((row) => row.strikeRate), { colors: topBarColors(topSr) });

  const minWickets = Number($("#minWickets")?.value || 0);
  const bowlingRows = appData.bowlingCareer.filter((row) => row.wickets >= minWickets && row.economy && row.strikeRate && !isScatterPlayerHidden("bowlingScatter", row.player));
  const [economyMin, economyMax] = getPaddedDomain(bowlingRows.map((row) => row.economy), 0.2, [5, 13]);
  const [strikeRateMin, strikeRateMax] = getPaddedDomain(bowlingRows.map((row) => row.strikeRate), 0.2, [10, 38]);
  const bowlingLabelMode = $("#bowlingLabelMode")?.value || "top";
  drawScatter($("#bowlingScatter"), bowlingRows, {
    x: (row) => row.economy,
    y: (row) => row.strikeRate,
    size: (row) => row.wickets,
    chartId: "bowlingScatter",
    xMin: Math.max(0, economyMin),
    xMax: economyMax,
    yMin: Math.max(0, strikeRateMin),
    yMax: strikeRateMax,
    xLabel: "Economy, lower is better",
    yLabel: "Bowling strike rate, lower is better",
    labelMode: bowlingLabelMode,
    labelPlayers: bowlingLabelPlayers,
    betterLabel: "Better economy + better strike rate",
    quadrants: {
      topLeft: "Control, slower wickets",
      topRight: "Expensive, slower wickets",
      bottomLeft: "Elite control + wickets",
      bottomRight: "Strike bowlers, costly"
    },
    color: (row) => selectedXII.some((pick) => pick.player === row.player) ? "#c8102e" : "#231f20",
    tooltip: (row) => `<strong>${row.player}</strong>${row.wickets} wickets<br>${compactNumber(row.economy)} economy<br>${compactNumber(row.strikeRate)} bowling SR<br>${compactNumber(row.average)} average<br>${row.matches} matches`
  });

  const wkEco = [...bowlingRows].sort((a, b) => b.wickets - a.wickets).slice(0, 12);
  drawHorizontalBarChart($("#wicketsEconomyChart"), wkEco.map((row) => row.player), wkEco.map((row) => row.wickets), { colors: wkEco.map((row) => row.economy <= 7.6 ? "#0f7a4b" : row.economy <= 8.2 ? "#c4932f" : "#c9152b") });
  const econ = [...bowlingRows].sort((a, b) => a.economy - b.economy).slice(0, 12);
  drawHorizontalBarChart($("#economyChart"), econ.map((row) => row.player), econ.map((row) => Number(row.economy.toFixed(2))), { colors: ["#0f7a4b", "#2364aa"] });
}

function renderAllVisibleCharts() {
  if (!appData) return;
  lastViewportKey = `${window.innerWidth}x${window.innerHeight}@${window.devicePixelRatio || 1}`;
  scatterPoints.delete($("#battingScatter"));
  scatterPoints.delete($("#bowlingScatter"));
  playerLabelBoxes.delete($("#battingScatter"));
  playerLabelBoxes.delete($("#bowlingScatter"));
  renderCharts();
  setupScatterTooltips();
}

function scheduleChartRender() {
  clearTimeout(scheduleChartRender.timer);
  scheduleChartRender.timer = setTimeout(() => {
    renderAllVisibleCharts();
  }, 120);
}

function setupChartResizeObservers() {
  window.removeEventListener("resize", scheduleChartRender);
  window.visualViewport?.removeEventListener("resize", scheduleChartRender);
  window.addEventListener("resize", scheduleChartRender);
  window.visualViewport?.addEventListener("resize", scheduleChartRender);
  if (setupChartResizeObservers.observer) setupChartResizeObservers.observer.disconnect();
  setupChartResizeObservers.observer = new ResizeObserver(() => scheduleChartRender());
  $$(".panel, .mini-table-wrap").forEach((element) => setupChartResizeObservers.observer.observe(element));
}

function setupScatterTooltips() {
  for (const id of ["battingScatter", "bowlingScatter"]) {
    const canvas = $(`#${id}`);
    if (!canvas) continue;
    const canvasPoint = (event) => {
      const source = event.touches?.[0] || event;
      const rect = canvas.getBoundingClientRect();
      return { x: source.clientX - rect.left, y: source.clientY - rect.top, clientX: source.clientX, clientY: source.clientY };
    };
    const hitQuadrant = (point) => (quadrantBoxes.get(canvas) || []).find((box) => point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h);
    const hitPlayerLabel = (point) => [...(playerLabelBoxes.get(canvas) || [])].reverse().find((box) => point.x >= box.x - 3 && point.x <= box.x + box.w + 3 && point.y >= box.y - 3 && point.y <= box.y + box.h + 3);
    const hitPoint = (point) => {
      const nearest = (scatterPoints.get(canvas) || [])
        .map((scatterPoint) => ({ point: scatterPoint, distance: Math.hypot(scatterPoint.x - point.x, scatterPoint.y - point.y) }))
        .sort((a, b) => a.distance - b.distance)[0];
      return nearest && nearest.distance <= nearest.point.radius + 8 ? nearest.point : null;
    };
    canvas.onmousedown = (event) => {
      const point = canvasPoint(event);
      const pointHit = hitPoint(point);
      const labelHit = pointHit ? null : hitPlayerLabel(point);
      if (labelHit) {
        playerLabelDrag = { canvas, chartId: id, player: labelHit.player, dx: point.x - labelHit.labelX, dy: point.y - labelHit.labelY, pointX: labelHit.pointX, pointY: labelHit.pointY, moved: false };
        canvas.style.cursor = "grabbing";
        $("#chartTooltip").hidden = true;
        event.preventDefault();
        return;
      }
      const hit = hitQuadrant(point);
      if (!hit) return;
      quadrantDrag = { canvas, chartId: id, key: hit.key, dx: point.x - hit.anchorX, dy: point.y - hit.anchorY, chart: hit.chart };
      canvas.style.cursor = "grabbing";
      $("#chartTooltip").hidden = true;
      event.preventDefault();
    };
    canvas.ontouchstart = (event) => {
      const point = canvasPoint(event);
      const pointHit = hitPoint(point);
      const labelHit = pointHit ? null : hitPlayerLabel(point);
      if (labelHit) {
        playerLabelDrag = { canvas, chartId: id, player: labelHit.player, dx: point.x - labelHit.labelX, dy: point.y - labelHit.labelY, pointX: labelHit.pointX, pointY: labelHit.pointY, moved: false };
        $("#chartTooltip").hidden = true;
        event.preventDefault();
        return;
      }
      const hit = hitQuadrant(point);
      if (!hit) return;
      quadrantDrag = { canvas, chartId: id, key: hit.key, dx: point.x - hit.anchorX, dy: point.y - hit.anchorY, chart: hit.chart };
      $("#chartTooltip").hidden = true;
      event.preventDefault();
    };
    canvas.onmousemove = (event) => {
      const point = canvasPoint(event);
      if (playerLabelDrag?.canvas === canvas) {
        const labelX = point.x - playerLabelDrag.dx;
        const labelY = point.y - playerLabelDrag.dy;
        savePlayerLabelPosition(playerLabelDrag.chartId, playerLabelDrag.player, {
          dx: Number((labelX - playerLabelDrag.pointX).toFixed(1)),
          dy: Number((labelY - playerLabelDrag.pointY).toFixed(1))
        });
        playerLabelDrag.moved = true;
        if (!setupScatterTooltips.dragFrame) {
          setupScatterTooltips.dragFrame = requestAnimationFrame(() => {
            setupScatterTooltips.dragFrame = null;
            renderAllVisibleCharts();
          });
        }
        return;
      }
      const quadrantHit = hitQuadrant(point);
      const labelHit = hitPlayerLabel(point);
      canvas.style.cursor = labelHit || quadrantHit ? "grab" : "default";
      if (quadrantDrag?.canvas === canvas) {
        const chart = quadrantDrag.chart;
        const anchorX = Math.min(chart.left + chart.width, Math.max(chart.left, point.x - quadrantDrag.dx));
        const anchorY = Math.min(chart.top + chart.height, Math.max(chart.top, point.y - quadrantDrag.dy));
        saveQuadrantPosition(quadrantDrag.chartId, quadrantDrag.key, {
          x: Number(((anchorX - chart.left) / chart.width).toFixed(4)),
          y: Number(((anchorY - chart.top) / chart.height).toFixed(4))
        });
        if (!setupScatterTooltips.dragFrame) {
          setupScatterTooltips.dragFrame = requestAnimationFrame(() => {
            setupScatterTooltips.dragFrame = null;
            renderAllVisibleCharts();
          });
        }
        return;
      }
      const points = scatterPoints.get(canvas) || [];
      const nearest = points
        .map((scatterPoint) => ({ point: scatterPoint, distance: Math.hypot(scatterPoint.x - point.x, scatterPoint.y - point.y) }))
        .sort((a, b) => a.distance - b.distance)[0];
      const hit = nearest?.point || null;
      const tooltip = $("#chartTooltip");
      if (!hit) {
        tooltip.hidden = true;
        return;
      }
      tooltip.innerHTML = hit.tooltip || `<strong>${hit.row.player}</strong>`;
      tooltip.style.left = `${Math.min(window.innerWidth - 280, point.clientX + 14)}px`;
      tooltip.style.top = `${Math.max(8, point.clientY + 14)}px`;
      tooltip.hidden = false;
    };
    canvas.ontouchmove = (event) => {
      if (!(quadrantDrag?.canvas === canvas || playerLabelDrag?.canvas === canvas)) return;
      canvas.onmousemove(event);
      event.preventDefault();
    };
    canvas.onclick = (event) => {
      if (setupScatterTooltips.suppressClick) {
        setupScatterTooltips.suppressClick = false;
        return;
      }
      const point = canvasPoint(event);
      const clickedPoint = hitPoint(point);
      if (!clickedPoint) {
        if (hitPlayerLabel(point) || hitQuadrant(point)) return;
        return;
      }
      hideScatterPlayer(id, clickedPoint.row.player);
      $("#chartTooltip").hidden = true;
      renderAllVisibleCharts();
    };
    canvas.onmouseleave = () => {
      $("#chartTooltip").hidden = true;
      if (!quadrantDrag) canvas.style.cursor = "default";
    };
  }
}

window.addEventListener("mouseup", () => {
  if (playerLabelDrag) {
    playerLabelDrag.canvas.style.cursor = "default";
    setupScatterTooltips.suppressClick = playerLabelDrag.moved;
    if (setupScatterTooltips.suppressClick) setTimeout(() => { setupScatterTooltips.suppressClick = false; }, 0);
    playerLabelDrag = null;
  }
  if (quadrantDrag) {
    quadrantDrag.canvas.style.cursor = "default";
    setupScatterTooltips.suppressClick = true;
    setTimeout(() => { setupScatterTooltips.suppressClick = false; }, 0);
    quadrantDrag = null;
  }
});

window.addEventListener("touchend", () => {
  if (playerLabelDrag) {
    playerLabelDrag.canvas.style.cursor = "default";
    playerLabelDrag = null;
  }
  if (quadrantDrag) {
    quadrantDrag.canvas.style.cursor = "default";
    quadrantDrag = null;
  }
});

function renderViewTabs() {
  $$(".view-tab").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".view-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      $$(".view-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === button.dataset.view));
      requestAnimationFrame(renderAllVisibleCharts);
    });
  });
}

function renderTabs() {
  $("#tableSelect").innerHTML = tableConfig.map(([key, label]) => `<option value="${key}" ${key === activeTable ? "selected" : ""}>${label}</option>`).join("");
  $("#tableSelect").onchange = (event) => {
    activeTable = event.target.value;
    sortState = defaultSorts[activeTable] || { key: Object.keys(appData[activeTable][0] || {})[0], dir: "asc" };
    page = 1;
    $("#tableSearch").value = "";
    renderTable();
  };
}

function renderTable() {
  const query = $("#tableSearch").value.toLowerCase();
  const pageSize = Number($("#pageSize").value);
  const allRows = [...(appData[activeTable] || [])].filter((row) => JSON.stringify(row).toLowerCase().includes(query));
  allRows.sort((a, b) => {
    const av = a[sortState.key];
    const bv = b[sortState.key];
    const direction = sortState.dir === "asc" ? 1 : -1;
    return compareValues(av, bv) * direction;
  });
  const pages = Math.max(1, Math.ceil(allRows.length / pageSize));
  page = Math.min(page, pages);
  const rows = allRows.slice((page - 1) * pageSize, page * pageSize);
  const keys = [...allRows.reduce((set, row) => {
    Object.keys(row).forEach((key) => set.add(key));
    return set;
  }, new Set(Object.keys((appData[activeTable] || [])[0] || {})))];
  $("#tableDescription").textContent = tableDescriptions[activeTable] || "";
  $("#tableCount").textContent = `${allRows.length} rows · page ${page} of ${pages}`;
  $("#dataTable").innerHTML = `
    <thead><tr>${keys.map((key) => `<th data-key="${key}">${labelize(key)}${sortState.key === key ? (sortState.dir === "asc" ? " ↑" : " ↓") : ""}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${keys.map((key) => `<td>${formatCell(row[key], key)}</td>`).join("")}</tr>`).join("")}</tbody>
  `;
  $$("th").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      sortState = { key, dir: sortState.key === key && sortState.dir === "desc" ? "asc" : "desc" };
      page = 1;
      renderTable();
    });
  });
  $("#pager").innerHTML = `
    <button id="prevPage" ${page === 1 ? "disabled" : ""}>Previous</button>
    <span>${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, allRows.length)} of ${allRows.length}</span>
    <button id="nextPage" ${page === pages ? "disabled" : ""}>Next</button>
  `;
  $("#prevPage").addEventListener("click", () => { page -= 1; renderTable(); });
  $("#nextPage").addEventListener("click", () => { page += 1; renderTable(); });
  $("#exportTableBtn").onclick = () => exportRows(`${activeTable}.csv`, allRows, keys.map((key) => ({ label: labelize(key), value: (row) => row[key] })));
}

function labelize(key) {
  const special = {
    strikeRate: "Strike Rate",
    notOuts: "Not Outs",
    highScore: "High Score",
    winPct: "Win %",
    bestXI: "Best XI",
    nr: "No Result",
    balls: "Balls",
    wickets: "Wickets",
    economy: "Economy"
  };
  if (special[key]) return special[key];
  return String(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase());
}

function formatCell(value, key = "") {
  if (/year|season/i.test(key) && value !== null && value !== undefined) return String(value);
  return format(value);
}

function comparableNumber(value) {
  if (typeof value === "number") return value;
  const text = String(value ?? "").replace(/,/g, "").replace(/\*/g, "").replace(/%/g, "").trim();
  if (!text || text === "-") return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareValues(a, b) {
  const an = comparableNumber(a);
  const bn = comparableNumber(b);
  if (an !== null && bn !== null) return an - bn;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportRows(filename, rows, columns) {
  const csv = [columns.map((column) => csvEscape(column.label)).join(","), ...rows.map((row) => columns.map((column) => csvEscape(column.value(row))).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderDataTable(selector, id, rows, columns, options = {}) {
  const container = $(selector);
  if (!container) return;
  const state = embeddedTableState.get(id) || { page: 1, pageSize: options.pageSize || 10, query: "", sortKey: options.sortKey || columns[0]?.key, sortDir: options.sortDir || "asc" };
  if (!embeddedTableState.has(id) && options.sortKey) {
    state.sortKey = options.sortKey;
    state.sortDir = options.sortDir || "asc";
  }
  embeddedTableState.set(id, state);
  const query = state.query.toLowerCase();
  const filtered = rows.filter((row) => columns.some((column) => String(column.value(row) ?? "").toLowerCase().includes(query)));
  filtered.sort((a, b) => compareValues(columns.find((column) => column.key === state.sortKey)?.value(a), columns.find((column) => column.key === state.sortKey)?.value(b)) * (state.sortDir === "asc" ? 1 : -1));
  const paginate = options.paginate !== false;
  const pages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const visible = paginate ? filtered.slice((state.page - 1) * state.pageSize, state.page * state.pageSize) : filtered;
  container.innerHTML = `
    <div class="embedded-tools">
      <input type="search" data-role="search" placeholder="Search ${options.label || "table"}" value="${state.query}">
      ${paginate ? `<label class="control">Rows <select data-role="pageSize">${[10, 25, 50, 100].map((size) => `<option ${state.pageSize === size ? "selected" : ""}>${size}</option>`).join("")}</select></label>` : ""}
      <button data-role="csv">Export CSV</button>
      <span>${paginate ? `${filtered.length} rows · page ${state.page} of ${pages}` : `${filtered.length} rows`}</span>
    </div>
    <div class="data-table-scroll">
      <table>
        <thead><tr>${columns.filter((column) => !column.hidden).map((column) => `<th data-key="${column.key}">${column.label}${state.sortKey === column.key ? (state.sortDir === "asc" ? " ↑" : " ↓") : ""}</th>`).join("")}</tr></thead>
        <tbody>${visible.map((row) => `<tr>${columns.filter((column) => !column.hidden).map((column) => `<td>${formatCell(column.value(row), column.key || column.label)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
    ${paginate && pages > 1 ? `<div class="pager">
      <button data-role="prev" ${state.page === 1 ? "disabled" : ""}>Previous</button>
      <span>${filtered.length ? (state.page - 1) * state.pageSize + 1 : 0}-${Math.min(state.page * state.pageSize, filtered.length)} of ${filtered.length}</span>
      <button data-role="next" ${state.page === pages ? "disabled" : ""}>Next</button>
    </div>` : ""}
  `;
  container.querySelector('[data-role="search"]').addEventListener("input", (event) => {
    state.query = event.target.value;
    state.page = 1;
    renderDataTable(selector, id, rows, columns, options);
  });
  container.querySelector('[data-role="pageSize"]')?.addEventListener("change", (event) => {
      state.pageSize = Number(event.target.value);
      state.page = 1;
      renderDataTable(selector, id, rows, columns, options);
    });
  container.querySelectorAll("th").forEach((th) => th.addEventListener("click", () => {
    const key = th.dataset.key;
    state.sortDir = state.sortKey === key && state.sortDir === "desc" ? "asc" : "desc";
    state.sortKey = key;
    state.page = 1;
    renderDataTable(selector, id, rows, columns, options);
  }));
  container.querySelector('[data-role="prev"]')?.addEventListener("click", () => {
    state.page -= 1;
    renderDataTable(selector, id, rows, columns, options);
  });
  container.querySelector('[data-role="next"]')?.addEventListener("click", () => {
    state.page += 1;
    renderDataTable(selector, id, rows, columns, options);
  });
  container.querySelector('[data-role="csv"]').addEventListener("click", () => {
    exportRows(`${id}.csv`, filtered, columns.filter((column) => !column.hidden));
  });
}

function makeRecordTable(title, id) {
  return `
    <section class="mini-table-wrap">
      <h2>${title}</h2>
      <div id="${id}"></div>
    </section>
  `;
}

function renderRecordTables() {
  const configs = [
    ["Highest Scores", "recordHighestScores", appData.highestScores, [
      { label: "Player", value: (row) => row.player },
      { label: "Runs", value: (row) => `${row.runs}${row.notOut ? "*" : ""}` },
      { label: "Balls", value: (row) => row.balls },
      { label: "SR", value: (row) => row.strikeRate },
      { label: "Opposition", value: (row) => row.opposition },
      { label: "Year", value: (row) => row.year }
    ]],
    ["Most Runs In A Season", "recordSeasonRuns", appData.seasonRuns, [
      { label: "Player", value: (row) => row.player },
      { label: "Season", value: (row) => row.season },
      { label: "Matches", value: (row) => row.matches },
      { label: "Runs", value: (row) => row.runs },
      { label: "Average", value: (row) => row.average ?? "-" },
      { label: "SR", value: (row) => row.strikeRate }
    ]],
    ["Most Wickets In A Season", "recordSeasonWickets", appData.seasonWickets, [
      { label: "Player", value: (row) => row.player },
      { label: "Season", value: (row) => row.season },
      { label: "Matches", value: (row) => row.matches },
      { label: "Wickets", value: (row) => row.wickets },
      { label: "Economy", value: (row) => row.economy },
      { label: "SR", value: (row) => row.strikeRate ?? "-" }
    ]],
    ["Best Bowling Innings", "recordBestBowling", appData.bestBowlingInnings, [
      { label: "Player", value: (row) => row.player },
      { label: "Figures", value: (row) => row.figures },
      { key: "Wickets", label: "Wickets", value: (row) => row.wickets, hidden: true },
      { key: "Runs", label: "Runs conceded", value: (row) => row.runs, hidden: true },
      { label: "Overs", value: (row) => row.overs },
      { label: "Opposition", value: (row) => row.opposition },
      { label: "Year", value: (row) => row.year }
    ]],
    ["Highest Partnerships", "recordPartnerships", appData.partnershipsByRuns, [
      { label: "Players", value: (row) => row.players },
      { label: "Runs", value: (row) => row.runs },
      { label: "Wicket", value: (row) => row.wicket },
      { label: "Opposition", value: (row) => row.opposition },
      { label: "Year", value: (row) => row.year }
    ]],
    ["Partnerships By Wicket", "recordPartnershipsByWicket", appData.partnershipsByWicket, [
      { label: "Players", value: (row) => row.players },
      { label: "Runs", value: (row) => row.runs },
      { label: "Wicket", value: (row) => row.wicket },
      { label: "Opposition", value: (row) => row.opposition },
      { label: "Year", value: (row) => row.year }
    ]],
    ["Fielding Catches", "recordFielding", appData.fieldingCareer, [
      { label: "Player", value: (row) => row.player },
      { label: "Matches", value: (row) => row.matches },
      { label: "Catches", value: (row) => row.catches }
    ]],
    ["Captaincy", "recordCaptains", appData.captains, [
      { label: "Captain", value: (row) => row.player },
      { label: "Span", value: (row) => row.span },
      { label: "Matches", value: (row) => row.matches },
      { label: "Won", value: (row) => row.won },
      { label: "Lost", value: (row) => row.lost },
      { label: "Win %", value: (row) => row.winPct }
    ]],
    ["Wicketkeeping", "recordKeeping", appData.keepingCareer, [
      { label: "Player", value: (row) => row.player },
      { label: "Matches", value: (row) => row.matches },
      { label: "Dismissals", value: (row) => row.dismissals },
      { label: "Catches", value: (row) => row.catches },
      { label: "Stumpings", value: (row) => row.stumpings }
    ]]
  ];
  $("#recordTables").innerHTML = configs.map(([title, id]) => makeRecordTable(title, id)).join("");
  configs.forEach(([title, id, rows, columns]) => {
    const keyedColumns = columns.map((column, index) => ({ ...column, key: column.key || column.label || String(index) }));
    const sort = {
      recordHighestScores: { sortKey: "Runs", sortDir: "desc" },
      recordSeasonRuns: { sortKey: "Runs", sortDir: "desc" },
      recordSeasonWickets: { sortKey: "Wickets", sortDir: "desc" },
      recordBestBowling: { sortKey: "Wickets", sortDir: "desc" },
      recordPartnerships: { sortKey: "Runs", sortDir: "desc" },
      recordPartnershipsByWicket: { sortKey: "Runs", sortDir: "desc" },
      recordFielding: { sortKey: "Catches", sortDir: "desc" },
      recordCaptains: { sortKey: "Win %", sortDir: "desc" },
      recordKeeping: { sortKey: "Dismissals", sortDir: "desc" }
    }[id] || {};
    renderDataTable(`#${id}`, id, rows, keyedColumns, { label: title, pageSize: 10, ...sort });
  });
}

function renderInsights() {
  const qualifiedBatters = appData.battingCareer.filter((row) => row.runs >= Number($("#minRuns")?.value || 200));
  const fastest = [...qualifiedBatters].sort((a, b) => b.strikeRate - a.strikeRate)[0];
  const bestAverage = [...qualifiedBatters].sort((a, b) => b.average - a.average)[0];
  const volume = [...qualifiedBatters].sort((a, b) => b.runs - a.runs)[0];
  const bestPeak = [...appData.highestScores].sort((a, b) => b.runs - a.runs)[0];
  const mostSixes = [...qualifiedBatters].sort((a, b) => (b.sixes || 0) - (a.sixes || 0))[0];
  const qualifiedBowlers = appData.bowlingCareer.filter((row) => row.wickets >= Number($("#minWickets")?.value || 10));
  const wicketLeader = [...qualifiedBowlers].sort((a, b) => b.wickets - a.wickets)[0];
  const economyLeader = [...qualifiedBowlers].sort((a, b) => a.economy - b.economy)[0];
  const strikeLeader = [...qualifiedBowlers].sort((a, b) => a.strikeRate - b.strikeRate)[0];
  const bestFigure = [...appData.bestBowlingInnings].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
  $("#battingInsights").innerHTML = [
    ["Highest Strike Rate", fastest?.player, `${fastest?.strikeRate} SR, ${fastest?.runs} runs`],
    ["Best Average", bestAverage?.player, `${bestAverage?.average} average`],
    ["Most Runs", volume?.player, `${format(volume?.runs)} runs`],
    ["Highest Innings", bestPeak?.player, `${bestPeak?.runs}${bestPeak?.notOut ? "*" : ""} vs ${bestPeak?.opposition}`],
    ["Most Sixes", mostSixes?.player, `${mostSixes?.sixes || 0} sixes`]
  ].map(([label, value, detail]) => `<div class="insight-card"><span>${label}</span><strong>${value || "No match"}</strong><small>${detail || ""}</small></div>`).join("");

  $("#bowlingInsights").innerHTML = [
    ["Most Wickets", wicketLeader?.player, `${wicketLeader?.wickets} wickets`],
    ["Best Economy", economyLeader?.player, `${economyLeader?.economy} economy`],
    ["Best Bowling SR", strikeLeader?.player, `${strikeLeader?.strikeRate} bowling SR`],
    ["Best Innings", bestFigure?.player, `${bestFigure?.figures} vs ${bestFigure?.opposition}`]
  ].map(([label, value, detail]) => `<div class="insight-card"><span>${label}</span><strong>${value || "No match"}</strong><small>${detail || ""}</small></div>`).join("");

  renderDataTable("#battingMiniTable", "battingMini", [...appData.battingCareer].sort((a, b) => b.runs - a.runs), [
    { key: "player", label: "Player", value: (row) => row.player },
    { key: "matches", label: "Matches", value: (row) => row.matches },
    { key: "runs", label: "Runs", value: (row) => row.runs },
    { key: "average", label: "Average", value: (row) => row.average },
    { key: "strikeRate", label: "Strike Rate", value: (row) => row.strikeRate },
    { key: "highScore", label: "High Score", value: (row) => row.highScore },
    { key: "hundreds", label: "100s", value: (row) => row.hundreds },
    { key: "fifties", label: "50s", value: (row) => row.fifties },
    { key: "sixes", label: "6s", value: (row) => row.sixes }
  ], { label: "batters", pageSize: 25, sortKey: "runs", sortDir: "desc" });
  renderDataTable("#bowlingMiniTable", "bowlingMini", [...appData.bowlingCareer].sort((a, b) => b.wickets - a.wickets), [
    { key: "player", label: "Player", value: (row) => row.player },
    { key: "matches", label: "Matches", value: (row) => row.matches },
    { key: "wickets", label: "Wickets", value: (row) => row.wickets },
    { key: "average", label: "Average", value: (row) => row.average },
    { key: "economy", label: "Economy", value: (row) => row.economy },
    { key: "strikeRate", label: "Strike Rate", value: (row) => row.strikeRate },
    { key: "best", label: "Best", value: (row) => row.best }
  ], { label: "bowlers", pageSize: 25, sortKey: "wickets", sortDir: "desc" });
  renderDataTable("#seasonMiniTable", "seasonMini", [...appData.teamPerformance], [
    { key: "season", label: "Season", value: (row) => row.season },
    { key: "matches", label: "Matches", value: (row) => row.matches },
    { key: "won", label: "Won", value: (row) => row.won },
    { key: "lost", label: "Lost", value: (row) => row.lost },
    { key: "points", label: "Points", value: (row) => row.points },
    { key: "result", label: "Result", value: (row) => seasonResults[row.season] || row.result }
  ], { label: "seasons", pageSize: 25, sortKey: "season", sortDir: "asc" });

  const selected = new Set(selectedXII.map((row) => row.player));
  const rows = [...selectedXII.map((row) => row.player), ...reservePlayers].map((player) => {
    const bat = appData.battingCareer.find((row) => row.player === player);
    const bowl = appData.bowlingCareer.find((row) => row.player === player);
    const matches = appData.mostMatches.find((row) => row.player === player)?.matches || bat?.matches || bowl?.matches || "";
    return { player, status: selected.has(player) ? "Selected XII" : "Reserve", statusRank: selected.has(player) ? 0 : 1, matches, bat, bowl };
  });
  renderDataTable("#xiStatsTable", "xiStats", rows, [
    { key: "statusRank", label: "Order", value: (row) => row.statusRank, hidden: true },
    { key: "player", label: "Player", value: (row) => row.player },
    { key: "status", label: "Status", value: (row) => row.status },
    { key: "matches", label: "Matches", value: (row) => row.matches || "-" },
    { key: "batting", label: "Batting", value: (row) => row.bat ? `${row.bat.runs} runs, ${row.bat.average} avg, ${row.bat.strikeRate} SR` : "-" },
    { key: "bowling", label: "Bowling", value: (row) => row.bowl ? `${row.bowl.wickets} wkts, ${row.bowl.economy} econ, ${row.bowl.strikeRate} SR` : "-" }
  ], { label: "XI players", pageSize: 50, paginate: false, sortKey: "statusRank", sortDir: "asc" });
}

function renderXI() {
  $("#xiGrid").innerHTML = selectedXII.map((pick) => `
    <div class="xi-card">
      <em>${pick.slot === 12 ? "Impact sub" : `No. ${pick.slot}`}${pick.captain ? " · Captain" : ""}${pick.foreign ? " · Overseas" : ""}</em>
      <strong>${pick.player}${pick.captain ? " (C)" : ""}</strong>
      <span>${pick.role}</span>
      <small>${playerStatLine(pick)}</small>
      <p>${pick.reason}</p>
    </div>
  `).join("");
}

function playerStatLine(pick) {
  const bat = appData.battingCareer.find((row) => row.player === pick.player);
  const bowl = appData.bowlingCareer.find((row) => row.player === pick.player);
  const keeping = appData.keepingCareer.find((row) => row.player === pick.player);
  const parts = [];
  if (["batter", "keeper"].includes(pick.type) && bat?.runs) parts.push(`${format(bat.runs)} runs · ${compactNumber(bat.average)} avg · ${compactNumber(bat.strikeRate)} SR`);
  if (pick.type === "keeper" && keeping?.dismissals) parts.push(`${keeping.dismissals} dismissals`);
  if (pick.type === "bowler" && bowl?.wickets) parts.push(`${bowl.wickets} wickets · ${compactNumber(bowl.economy)} econ · ${compactNumber(bowl.strikeRate)} bowling SR`);
  if (pick.type === "allrounder") {
    if (bat?.runs) parts.push(`${format(bat.runs)} runs · ${compactNumber(bat.average)} avg · ${compactNumber(bat.strikeRate)} SR`);
    if (bowl?.wickets) parts.push(`${bowl.wickets} wickets · ${compactNumber(bowl.economy)} econ · ${compactNumber(bowl.strikeRate)} bowling SR`);
  }
  return parts.join(" | ") || "Role selection";
}

function renderArticle() {
  $("#article").innerHTML = `
    <details open>
    <summary>Selection Rationale</summary>
    <p>This is not purely career aggregate. It weights franchise impact, title relevance, role balance, era context and sample size.</p>
    <p>Virat Kohli is the first name. The data case is overwhelming: 9,464 Cricinfo-listed RCB runs, a franchise-defining 973-run 2016 season at 152.03 strike rate, a 113 in 2016, and the largest matches-played sample in the squad. Captaincy is part of his case too: 143 matches as captain in the Cricinfo table, plus the franchise identity value of carrying RCB across eras. He also gives the side elite boundary fielding and can either anchor or open with tempo.</p>
    <p>Chris Gayle is selected because his peak changes the geometry of a T20 innings. His RCB record includes 3,420 runs at a strike rate above 154, a 733-run season at 160.74, and the 175* against Pune Warriors in 2013, still the innings that defines his ceiling. Faf du Plessis is a serious opener candidate, but Gayle's ceiling wins the overseas opener slot.</p>
    <p>AB de Villiers is the middle-order lock. He combines 4,500-plus RCB runs, an average above 40, a strike rate near 160, the 133* against Mumbai Indians in 2015, and a 687-run 2016 season at 168.79. He also appears near the top of the catching and wicketkeeping tables, which matters even if this XI uses Dinesh Karthik with the gloves.</p>
    <p>Rajat Patidar gets No. 3 and the captaincy because the title-winning season carries extra weight. Patidar's 112* in the 2022 playoff against Lucknow is one of RCB's best high-pressure innings, and his strike rate profile keeps the top order from becoming too anchor-heavy.</p>
    <p>Dinesh Karthik is the keeper-finisher. The key case is role scarcity: RCB have had bigger top-order names, but fewer Indian players who can keep and close an innings. His Cricinfo line has 937 runs at a 162.95 strike rate, plus wicketkeeping value, including the 2022 season role that changed RCB's death-overs batting.</p>
    <p>Glenn Maxwell is picked over Jacques Kallis because this XI needs middle-overs acceleration more than another anchor. Maxwell's RCB strike rate is around 159, he attacks spin immediately, and his off-spin gives match-up overs. Kallis has 1,100-plus RCB runs and all-round pedigree, but his RCB strike rate around 113 is difficult in this particular batting order.</p>
    <p>Krunal Pandya gets the edge over Washington Sundar because the title-winning season carries extra weight, he offers left-hand batting balance, practical middle/lower-order value, and a stronger wicket-taking contribution in the RCB sample.</p>
    <p>Anil Kumble and Yuzvendra Chahal are both selected. Chahal is RCB's leading wicket-taker in Cricinfo's table with 139 wickets and a 17.43 bowling strike rate, which makes him the middle-overs wicket engine. Kumble brings the control option: 53 wickets at 6.65 economy and the 5/5 against Rajasthan Royals in 2009, one of the best spells in franchise history.</p>
    <p>Josh Hazlewood gets the overseas fast-bowling slot. Hazlewood's longer RCB body of work, title-era relevance, and control profile make him a better all-time RCB fit, even if Starc has the more explosive peak and left-arm angle.</p>
    <p>Bhuvneshwar Kumar gets the nod over Mohammed Siraj for new-ball craft, later-era context, and title-season value. Raw economy comparisons across eras can be misleading because scoring rates have inflated over time.</p>
    <p>Harshal Patel is the impact substitute. His 2021 season, 32 wickets at a 10.56 strike rate, is too strong to leave outside the XII, and the impact role fits his condition-specific death bowling value.</p>
    </details>
    <details>
    <summary>Missed Cuts</summary>
    <p>Faf du Plessis misses despite 1,636 RCB runs, a 730-run 2023 season, and a 50 percent captaincy win rate because the four-overseas cap is brutal. Wanindu Hasaranga misses despite 35 wickets at a 15.77 strike rate because Chahal and Kumble already cover wrist-spin/control. Starc misses despite the left-arm angle because Hazlewood's RCB body of work and title-era relevance fit this XI better. Siraj misses despite 83 wickets because Bhuvneshwar's new-ball craft and title context get the edge. Tim David comes close as a high-impact finisher, but Maxwell's longer RCB stint, middle-overs acceleration, spin option, and role flexibility keep him ahead.</p>
    </details>
    <details>
    <summary>Final XII</summary>
    <p>The final impact-era XII is Chris Gayle, Virat Kohli, Rajat Patidar (C), AB de Villiers, Glenn Maxwell, Dinesh Karthik, Krunal Pandya, Anil Kumble, Yuzvendra Chahal, Josh Hazlewood, Bhuvneshwar Kumar, with Harshal Patel as impact substitute. The overseas count in the XI is exactly four: Gayle, de Villiers, Maxwell and Hazlewood.</p>
    </details>
  `;
}

async function loadData() {
  let response = await fetch("data/rcb-data.json");
  if (!response.ok) response = await fetch("/api/data");
  appData = await response.json();
  $("#statusLine").textContent = `Last updated: ${formatDateTime(appData.generatedAt)}.`;
  renderKpis();
  renderTabs();
  renderTable();
  renderXI();
  renderArticle();
  renderInsights();
  renderRecordTables();
  setupChartResizeObservers();
  setupScatterTooltips();
  requestAnimationFrame(renderAllVisibleCharts);
}

renderViewTabs();
$("#seasonMetric").addEventListener("change", renderAllVisibleCharts);
$("#seasonMetricLarge").addEventListener("change", renderAllVisibleCharts);
$("#leaderMetric").addEventListener("change", renderAllVisibleCharts);
$("#battingLabelMode").addEventListener("change", renderAllVisibleCharts);
$("#bowlingLabelMode").addEventListener("change", renderAllVisibleCharts);
$("#minRuns").addEventListener("input", () => { renderInsights(); renderAllVisibleCharts(); });
$("#minWickets").addEventListener("input", () => { renderInsights(); renderAllVisibleCharts(); });
$("#resetBattingScatter").addEventListener("click", () => {
  clearHiddenScatterPlayers("battingScatter");
  renderAllVisibleCharts();
});
$("#resetBowlingScatter").addEventListener("click", () => {
  clearHiddenScatterPlayers("bowlingScatter");
  renderAllVisibleCharts();
});
$("#tableSearch").addEventListener("input", () => { page = 1; renderTable(); });
$("#pageSize").addEventListener("change", () => { page = 1; renderTable(); });

window.addEventListener("resize", () => {
  if (appData) scheduleChartRender();
});

loadData();
