// === Widget Metadata 定義 ===
const WidgetMetadata = {
  id: "IMDbWatchlist",
  title: "IMDb Watchlist × TMDB 整合",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "通过解析 IMDb Watchlist 获取影片，并结合 TMDB 显示播放平台与评分",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "watchlist",
      title: "IMDb Watchlist",
      functionName: "loadIMDbWatchlist",
      params: [
        {
          name: "user_id",
          title: "IMDb 用户 ID",
          type: "input",
          description: "例如 ur204635540",
        },
        {
          name: "language",
          title: "语言",
          type: "language",
          value: "zh-CN"
        }
      ]
    }
  ]
};

// === IMDb Watchlist 主函數 ===
async function loadIMDbWatchlist(params) {
  const userId = params.user_id;
  const language = params.language ?? "zh-CN";
  const url = `https://www.imdb.com/user/${userId}/watchlist`;

  const response = await Widget.http.get(url, {
    headers: {
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response?.data) throw new Error("IMDb Watchlist 读取失败");

  const $ = Widget.html.load(response.data);
  const imdbIds = [];

  $("div.lister-item").each((_, el) => {
    const id = $(el).attr("data-tconst");
    if (id) imdbIds.push(id);
  });

  if (imdbIds.length === 0) throw new Error("找不到任何 IMDb 项目");

  const results = [];
  for (const imdbId of imdbIds) {
    try {
      const item = await fetchTMDBByIMDbID(imdbId, language);
      if (item) results.push(item);
    } catch (err) {
      console.warn(`跳过 ${imdbId}：`, err.message);
    }
  }

  return results;
}

// === IMDb ID → TMDB 詳情爬蟲函數（無 API Key） ===
async function fetchTMDBByIMDbID(imdbId, language = "zh-CN") {
  const url = `https://www.themoviedb.org/find/${imdbId}?language=${language}`;
  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.themoviedb.org/",
      "User-Agent": "Mozilla/5.0"
    }
  });

  const $ = Widget.html.load(response.data);
  const firstResult = $(".card.style_1").first();
  const link = firstResult.find("a").attr("href");
  const title = firstResult.find(".title").text().trim();
  const overview = firstResult.find(".overview").text().trim();
  const poster = firstResult.find("img.poster").attr("data-src") || firstResult.find("img.poster").attr("src");

  if (!link) return null;

  const match = link.match(/^\/(movie|tv)\/(\d+)/);
  if (!match) return null;

  const type = match[1];
  const id = match[2];

  return {
    id,
    mediaType: type,
    title,
    description: overview,
    posterPath: poster,
    type: "tmdb"
  };
}
