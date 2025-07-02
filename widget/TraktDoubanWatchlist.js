WidgetMetadata = {
  id: "TraktWatchlist",
  title: "Trakt Watchlist",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "從 Trakt 抓取使用者 Watchlist，轉換為 TMDB 項目顯示（無需 API Key）",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "watchlist",
      title: "Trakt 想看清單",
      requiresWebView: false,
      functionName: "loadTraktWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "trakt_user",
          title: "Trakt 使用者名稱",
          type: "input",
          required: true,
        }
      ]
    }
  ]
};

async function loadTraktWatchlist(params) {
  const { trakt_user } = params;

  const watchlistUrl = `https://trakt.tv/users/${trakt_user}/watchlist`;
  const html = await (await fetch(watchlistUrl)).text();

  const items = extractTraktItems(html, "Trakt Watchlist");

  const results = [];
  for (const item of items) {
    const query = encodeURIComponent(`${item.title} ${item.year}`);
    const searchUrl = `https://www.themoviedb.org/search?query=${query}`;
    const searchHtml = await (await fetch(searchUrl)).text();
    const match = [...searchHtml.matchAll(/href="\/(movie|tv)\/(\d+)-[^"]+"/g)][0];
    if (match) {
      results.push({
        title: `${item.title} (${item.year})`,
        description: `來源：Trakt Watchlist`,
        type: match[1],
        tmdb_id: match[2],
        url: `https://www.themoviedb.org/${match[1]}/${match[2]}`,
        poster: `https://image.tmdb.org/t/p/w500/${match[2]}.jpg`,
      });
    }
  }

  return results;
}

function extractTraktItems(html, source) {
  const matches = [...html.matchAll(/data-type="(movie|show)".+?data-title="([^"]+)".+?data-year="(\d{4})"/g)];
  return matches.map(m => ({
    source,
    type: m[1],
    title: m[2],
    year: m[3],
  }));
}
