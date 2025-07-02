WidgetMetadata = {
  id: "TraktDoubanWatchlist",
  title: "Trakt + Douban 想看整合",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "整合 Trakt 與 Douban 的 Watchlist，無需 API Key，自動轉為 TMDB 項目",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "combinedWatchlist",
      title: "我的 Watchlist（Trakt + Douban）",
      requiresWebView: false,
      functionName: "loadCombinedWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "trakt_user",
          title: "Trakt 使用者名稱",
          type: "input",
          required: true,
        },
        {
          name: "douban_uid",
          title: "豆瓣使用者 ID（數字）",
          type: "input",
          required: true,
        }
      ],
    }
  ]
}
async function loadCombinedWatchlist(params) {
  const { trakt_user, douban_uid } = params;

  // === 1. Trakt Watchlist ===
  const traktRes = await fetch(`https://trakt.tv/users/${trakt_user}/watchlist`);
  const traktHtml = await traktRes.text();
  const traktItems = [...traktHtml.matchAll(/data-type="(movie|show)".+?data-title="([^"]+)".+?data-year="(\d{4})".+?data-trakt-id="(\d+)"/g)].map(match => ({
    source: "Trakt",
    type: match[1],
    title: match[2],
    year: match[3],
    trakt_id: match[4],
  }));

  // === 2. Douban Watchlist（電影與影集） ===
  const doubanUrls = [
    `https://movie.douban.com/people/${douban_uid}/wish?start=0&sort=time&rating=all&filter=all`,  // 電影
    `https://movie.douban.com/people/${douban_uid}/wish?start=0&sort=time&rating=all&filter=tv`   // 劇集
  ];

  const doubanItems = [];
  for (const url of doubanUrls) {
    const doubanRes = await fetch(url);
    const doubanHtml = await doubanRes.text();
    const regex = /<li.+?title="(.+?)".+?year">\((\d{4})\)/g;
    const matches = [...doubanHtml.matchAll(regex)];
    for (const match of matches) {
      doubanItems.push({
        source: "Douban",
        title: match[1],
        year: match[2],
        type: url.includes("filter=tv") ? "show" : "movie"
      });
    }
  }

  // === 3. 合併去重 & 補 TMDB ID ===
  const allItems = [...traktItems, ...doubanItems];

  // 嘗試從 TMDB 補充 ID
  const results = [];
  for (const item of allItems) {
    const query = encodeURIComponent(`${item.title} ${item.year}`);
    const searchUrl = `https://www.themoviedb.org/search?query=${query}`;
    const searchRes = await fetch(searchUrl);
    const searchHtml = await searchRes.text();

    const match = [...searchHtml.matchAll(/href="\/(movie|tv)\/(\d+)-[^"]+"/g)][0];
    if (match) {
      results.push({
        source: item.source,
        title: item.title,
        year: item.year,
        type: match[1],
        tmdb_id: match[2],
        url: `https://www.themoviedb.org/${match[1]}/${match[2]}`
      });
    }
  }

  return results.map(item => ({
    title: `${item.title} (${item.year})`,
    description: `來源：${item.source}`,
    poster: `https://image.tmdb.org/t/p/w500/${item.tmdb_id}.jpg`,
    url: item.url
  }));
}
