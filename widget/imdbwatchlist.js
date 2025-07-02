// ForwardWidgets 模組定義
const WidgetMetadata = {
  id: "imdb.watchlist",
  title: "IMDb Watchlist",
  description: "解析 IMDb 用戶 Watchlist 頁面，抽取影片列表（無需 API Key）",
  version: "1.0.0",
  author: "Forward",
  site: "https://www.imdb.com",
  modules: [
    {
      id: "default",
      title: "IMDb Watchlist",
      requiresWebView: false,
      functionName: "loadWatchlist",
      cacheDuration: 3600, // 秒，1小時快取
      params: [
        {
          name: "user_id",
          title: "IMDb 用戶 ID",
          type: "string",
          required: true,
          description: "IMDb 用戶名稱或ID，如 'ur12345678'"
        }
      ]
    }
  ]
};

// 對應的函數 loadWatchlist（Node.js / 支援 cheerio）
const cheerio = require('cheerio');

async function loadWatchlist(params) {
  const { user_id } = params;
  if (!user_id) {
    throw new Error("請提供有效的 IMDb 用戶 ID");
  }

  const url = `https://www.imdb.com/user/${user_id}/watchlist`;

  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0 (compatible; ForwardWidget/1.0)"
    }
  });

  if (!res.ok) {
    throw new Error(`無法取得 IMDb Watchlist，HTTP狀態: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];

  $(".lister-list .lister-item").each((_, elem) => {
    const el = $(elem);

    const link = el.find(".lister-item-header a").attr("href") || "";
    const imdbIdMatch = link.match(/\/title\/(tt\d+)/);
    const imdbId = imdbIdMatch ? imdbIdMatch[1] : null;

    const title = el.find(".lister-item-header a").text().trim();

    const yearText = el.find(".lister-item-year").text().trim();
    const yearMatch = yearText.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

    const poster = el.find(".lister-item-image img").attr("loadlate") || el.find(".lister-item-image img").attr("src") || null;

    if (imdbId) {
      items.push({
        imdbId,
        title,
        year,
        poster
      });
    }
  });

  return {
    total: items.length,
    items
  };
}
