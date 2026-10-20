/* 北美日票房 - ForwardWidget
 * 資料來源：Box Office Mojo 單日票房，並用 TMDB 對應電影資料
 */
WidgetMetadata = {
  id: "forward.boxoffice.daily",
  title: "北美日票房",
  icon: "https://cdn.phototourl.com/member/2026-10-20-f9477941-892f-414a-a8a5-ff547ce4e3fd.png",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "Box Office Mojo 北美單日票房排行，並對應 TMDB 電影資料。This product uses the TMDB API but is not endorsed or certified by TMDB.",
  author: "Custom ForwardWidget",
  site: "https://www.boxofficemojo.com/",
  detailCacheDuration: 3600,
  modules: [
    {
      id: "boxOfficeDaily", title: "北美日票房", description: "Box Office Mojo 單日票房排行", functionName: "loadDaily",
      cacheDuration: 3600,
      params: [
        { name: "date", title: "日期", type: "input", description: "YYYY-MM-DD，留空則取 2 天前", value: "" },
        { name: "limit", title: "顯示數量", type: "enumeration", value: "20", enumOptions: [{ title: "前 10", value: "10" }, { title: "前 20", value: "20" }, { title: "全部", value: "999" }] },
        { name: "language", title: "TMDB 語言", type: "enumeration", value: "zh-TW", enumOptions: [{ title: "繁體中文", value: "zh-TW" }, { title: "簡體中文", value: "zh-CN" }, { title: "English", value: "en-US" }] }
      ]
    }
  ]
};

const BOM_BASE = "https://www.boxofficemojo.com";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

// ---------- 入口 ----------

async function loadDaily(params = {}) {
  const date = normalizeDate(params.date, 2);
  const url = `${BOM_BASE}/date/${date}/`;
  return loadChart(url, params, "day");
}

// ---------- 主流程 ----------

async function loadChart(url, params, mode) {
  const limit = parseInt(params.limit || "20", 10);
  const language = params.language || "zh-TW";

  const res = await Widget.http.get(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!res || !res.data) throw new Error("無法取得 Box Office Mojo 頁面");

  const rows = parseTable(res.data).slice(0, limit);
  if (rows.length === 0) throw new Error("該日期沒有票房資料，請換一個日期");

  const items = await Promise.all(
    rows.map((row) => toItem(row, language, mode).catch(() => fallbackItem(row, mode)))
  );
  return items.filter(Boolean);
}

// 純字串解析（不依賴 cheerio API，相容 Forward 的 HTML 解析器）
// 依表頭名稱定位欄位，避免欄位順序變動時解析錯位
function parseTable(html) {
  const tables = String(html).match(/<table\b[\s\S]*?<\/table>/gi) || [];
  const table = tables.find((t) => t.indexOf("/release/") !== -1);
  if (!table) return [];

  const rows = table.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
  const cellsOf = (tr) => {
    const cells = [];
    const re = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = re.exec(tr)) !== null) cells.push({ tag: m[1].toLowerCase(), html: m[2] });
    return cells;
  };

  const headerRow = rows.find((tr) => /<th\b/i.test(tr));
  const headers = headerRow ? cellsOf(headerRow).map((c) => cleanText(c.html).toLowerCase()) : [];
  const col = (...names) => headers.findIndex((h) => names.some((n) => h === n || h.startsWith(n)));

  const idx = {
    rank: col("rank"),
    release: col("release"),
    gross: col("gross", "daily"),
    total: col("total gross", "to date"),
    theaters: col("theaters"),
    span: col("weeks", "days"),
    distributor: col("distributor")
  };

  const out = [];
  rows.forEach((tr) => {
    const tds = cellsOf(tr).filter((c) => c.tag === "td");
    if (!tds.length) return;
    const cell = (i) => (i >= 0 && i < tds.length ? cleanText(tds[i].html) : "");

    const link = tr.match(/<a\b[^>]*href="([^"]*\/release\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!link) return;
    const href = link[1].replace(/&amp;/g, "&");
    const title = cleanText(link[2]);
    if (!title) return;
    const relId = (href.match(/\/release\/(rl\d+)/) || [])[1] || title;

    out.push({
      rank: cell(idx.rank) || String(out.length + 1),
      title,
      releaseUrl: (href.indexOf("http") === 0 ? "" : BOM_BASE) + href.split("?")[0],
      releaseId: relId,
      gross: cell(idx.gross),
      total: cell(idx.total),
      theaters: cell(idx.theaters),
      span: cell(idx.span),
      distributor: cell(idx.distributor).replace(/See full company information/i, "").trim()
    });
  });
  return out;
}

async function toItem(row, language, mode) {
  const movie = await searchTmdb(row.title, language);
  const desc = buildDescription(row, mode);

  if (!movie) return fallbackItem(row, mode);

  return {
    id: String(movie.id),
    type: "tmdb",
    mediaType: "movie",
    title: `${row.rank}. ${movie.title || row.title}`,
    originalTitle: row.title,
    description: desc,
    posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : undefined,
    releaseDate: movie.release_date || undefined,
    rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : undefined
  };
}

function fallbackItem(row, mode) {
  return {
    id: row.releaseId,
    type: "url",
    title: `${row.rank}. ${row.title}`,
    description: buildDescription(row, mode),
    link: row.releaseUrl
  };
}

function buildDescription(row, mode) {
  const parts = [];
  if (row.gross) parts.push(`${mode === "week" ? "本週" : "當日"} ${row.gross}`);
  if (row.total) parts.push(`累計 ${row.total}`);
  if (row.span) parts.push(`第 ${row.span} ${mode === "week" ? "週" : "天"}`);
  if (row.theaters && row.theaters !== "-") parts.push(`${row.theaters} 間戲院`);
  if (row.distributor && row.distributor !== "-") parts.push(row.distributor);
  return parts.join("｜");
}

// ---------- TMDB 匹配 ----------

async function searchTmdb(title, language) {
  const query = title.replace(/\s*\(\d{4}(?: Re-release)?\)\s*$/i, "").trim();
  const thisYear = new Date().getFullYear();

  const res = await Widget.tmdb.get("/search/movie", {
    params: { query, language, include_adult: false }
  });
  const results = (res && res.results) || [];
  if (!results.length) return null;

  // 優先選標題完全相符、且上映年份接近今年的
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(query);
  const scored = results.map((m) => {
    let score = 0;
    if (norm(m.original_title) === target || norm(m.title) === target) score += 10;
    const y = parseInt((m.release_date || "").slice(0, 4), 10);
    if (y) score += Math.max(0, 5 - Math.abs(thisYear - y));
    score += Math.min(3, (m.popularity || 0) / 50);
    return { m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].m;
}

// ---------- 工具 ----------

function cleanText(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(input, daysAgo) {
  const s = (input || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(Date.now() - daysAgo * 86400000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
