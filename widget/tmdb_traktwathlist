WidgetMetadata = {
  id: "TraktWatchlistTMDB",
  title: "Trakt Watchlist × TMDB平台篩選",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description:
    "解析 Trakt Watchlist 並整合 TMDB 平台篩選，支援電影與影集，自定義地區/年份/平台。",
  author: "馬顥心",
  site: "https://github.com/你的Github",
  modules: [
    {
      title: "Trakt Watchlist × TMDB 平台",
      functionName: "loadTraktWatchlistWithPlatform",
      requiresWebView: false,
      cacheDuration: 3600,
      params: [
        {
          name: "user_name",
          title: "Trakt 用戶名",
          type: "input",
          default: "",
        },
        {
          name: "region",
          title: "地區",
          type: "select",
          options: ["TW", "US", "JP", "KR"],
          default: "TW",
        },
        {
          name: "platform_filter",
          title: "播放平台（可空）",
          type: "input",
          default: "",
          description: "用逗號分隔平台（如 netflix,disney+）",
        },
        {
          name: "year_range",
          title: "年份範圍（如2015-2025）",
          type: "input",
          default: "",
        }
      ],
    },
  ],
};

async function loadTraktWatchlistWithPlatform({ user_name, region, platform_filter, year_range }) {
  if (!user_name) return [];

  const list = [];

  // ===== 1. 從 Trakt 取得 Watchlist =====
  const traktUrl = `https://api.trakt.tv/users/${user_name}/watchlist`;
  const traktHeaders = {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": "9f84b41d046244be8a0e127a76a3dbee", // 官方公開 Key
  };

  const traktRes = await fetch(traktUrl, { headers: traktHeaders });
  const traktJson = await traktRes.json();

  // ===== 2. 擷取 tmdb_id 或 imdb_id =====
  const ids = traktJson.map(item => {
    const type = item.type;
    const data = item[type];
    return {
      type,
      title: data?.title,
      year: data?.year,
      tmdb_id: data?.ids?.tmdb,
      imdb_id: data?.ids?.imdb,
    };
  });

  // ===== 3. 設定平台條件 =====
  const platforms = platform_filter
    ? platform_filter.split(",").map(p => p.trim().toLowerCase())
    : [];

  const [startYear, endYear] = (year_range || "").split("-").map(v => parseInt(v));

  for (const item of ids) {
    const tmdbId = item.tmdb_id;
    if (!tmdbId) continue;

    const url = `https://www.themoviedb.org/${item.type === "movie" ? "movie" : "tv"}/${tmdbId}`;
    const html = await (await fetch(url)).text();

    // 抓播放平台 JSON
    const matched = html.match(/"watch/providers":\s*(\{.+?\})\s*,\s*"external_ids"/);
    const json = matched ? JSON.parse(matched[1]) : {};

    const providers = json?.results?.[region]?.flatrate || [];
    const providerNames = providers.map(p => p.provider_name.toLowerCase());

    // 平台不符則跳過
    if (platforms.length && !platforms.some(p => providerNames.includes(p))) continue;

    // 年份範圍不符則跳過
    if (startYear && endYear) {
      if (item.year < startYear || item.year > endYear) continue;
    }

    // 組合顯示項
    list.push({
      title: item.title,
      subtitle: `${item.year}｜${providerNames.join(", ")}`,
      image: `https://image.tmdb.org/t/p/w500${html.match(/"poster_path":"(.*?)"/)?.[1] ?? ""}`,
      url,
    });
  }

  return list;
}
