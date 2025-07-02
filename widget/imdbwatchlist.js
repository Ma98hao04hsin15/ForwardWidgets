const puppeteer = require('puppeteer');
const { fetchTmdbInfoByImdb, PlatformMapping } = require('./forward.tmdb.fetchByImdb');

const WidgetMetadata = {
  id: "forward.imdb.watchlist.tmdb",
  title: "IMDb Watchlist + TMDB平台過濾",
  version: "1.0.0",
  description: "抓取 IMDb Watchlist，轉為 TMDB 詳細資料並支援平台過濾，無需 API Key",
  author: "Forward",
  site: "https://www.imdb.com",
  modules: [
    {
      id: "default",
      title: "IMDb Watchlist + TMDB平台過濾",
      functionName: "loadEnrichedWatchlist",
      requiresWebView: false,
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "IMDb 用戶 ID",
          type: "string",
          required: true
        },
        {
          name: "platforms",
          title: "播放平台（可多選）",
          type: "multi-select",
          options: Object.entries(PlatformMapping).map(([key, value]) => ({
            title: value,
            value: key
          }))
        },
        {
          name: "min_year",
          title: "最小年份",
          type: "number"
        },
        {
          name: "max_year",
          title: "最大年份",
          type: "number"
        }
      ]
    }
  ]
};

async function loadImdbWatchlist(user_id) {
  const url = `https://www.imdb.com/user/${user_id}/watchlist`;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0');

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('.lister-list .lister-item', { timeout: 15000 });
  } catch (err) {
    await browser.close();
    throw new Error("無法載入 IMDb Watchlist 頁面，請確認用戶 ID 或網路狀況。");
  }

  const items = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('.lister-list .lister-item').forEach(el => {
      const a = el.querySelector('.lister-item-header a');
      const href = a?.href || "";
      const imdbIdMatch = href.match(/\/title\/(tt\d+)/);
      const imdbId = imdbIdMatch?.[1] || null;
      const title = a?.textContent.trim() || null;
      const yearText = el.querySelector('.lister-item-year')?.textContent || "";
      const yearMatch = yearText.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
      const poster = el.querySelector('.lister-item-image img')?.getAttribute('loadlate') ||
                     el.querySelector('.lister-item-image img')?.src || null;
      if (imdbId) {
        results.push({ imdbId, title, year, poster });
      }
    });
    return results;
  });

  await browser.close();
  return items;
}

async function loadEnrichedWatchlist(params) {
  const { user_id, platforms = [], min_year, max_year } = params;
  if (!user_id) throw new Error("請提供 IMDb 用戶 ID");

  const imdbItems = await loadImdbWatchlist(user_id);

  const enriched = [];
  for (const item of imdbItems) {
    const tmdb = await fetchTmdbInfoByImdb(item.imdbId);
    if (!tmdb) continue;

    if (min_year && tmdb.year && tmdb.year < min_year) continue;
    if (max_year && tmdb.year && tmdb.year > max_year) continue;
    if (platforms.length > 0 && tmdb.platforms) {
      const matched = tmdb.platforms.some(p =>
        platforms.some(filter => p.toLowerCase() === filter.toLowerCase())
      );
      if (!matched) continue;
    }

    enriched.push({
      imdbId: item.imdbId,
      title: item.title,
      year: item.year,
      poster: item.poster,
      tmdbId: tmdb.id,
      tmdbType: tmdb.type,
      tmdbTitle: tmdb.title,
      platforms: tmdb.platforms,
      region: tmdb.region
    });
  }

  return {
    total: enriched.length,
    items: enriched
  };
}

module.exports = {
  WidgetMetadata,
  loadEnrichedWatchlist
};
