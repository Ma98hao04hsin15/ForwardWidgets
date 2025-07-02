const WidgetMetadata = {
  id: "trakt.douban",
  title: "Trakt 想看清單（對接豆瓣）",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "從 Trakt 想看清單讀取 IMDb ID，並對應到豆瓣作品資料",
  author: "Forward",
  site: "https://trakt.tv/users/joy98ma0415/watchlist",
  modules: [
    {
      title: "Trakt 想看 × 豆瓣",
      requiresWebView: false,
      functionName: "loadTraktWatchlistWithDouban",
      cacheDuration: 3600,
      params: []
    }
  ]
};

async function searchDoubanByIMDb(imdbId) {
  const searchUrl = `https://www.douban.com/search?cat=1002&q=${imdbId}`;
  const html = await (await fetch(searchUrl)).text();

  const match = html.match(/<a href="(https:\/\/movie\.douban\.com\/subject\/\d+\/)"/);
  if (!match) return null;

  const doubanUrl = match[1];
  const detailHtml = await (await fetch(doubanUrl)).text();

  const title = detailHtml.match(/<span property="v:itemreviewed">([^<]+)<\/span>/)?.[1] || imdbId;
  const year = detailHtml.match(/<span class="year">\((\d{4})\)<\/span>/)?.[1] || "";
  const poster = detailHtml.match(/<img src="(https:\/\/img\d+\.doubanio\.com\/view\/photo\/[^"]+\.jpg)"/)?.[1] || "";

  return {
    id: imdbId,
    title,
    year,
    poster,
  };
}

async function loadTraktWatchlistWithDouban() {
  const url = "https://trakt.tv/users/joy98ma0415/watchlist?sort=rank,asc";
  const html = await (await fetch(url)).text();

  const imdbIds = Array.from(html.matchAll(/data-imdb-id="(tt\d+)"/g)).map(m => m[1]);
  const uniqueIds = [...new Set(imdbIds)];

  const items = await Promise.all(
    uniqueIds.map(imdb => searchDoubanByIMDb(imdb))
  );

  return items.filter(Boolean);
}
