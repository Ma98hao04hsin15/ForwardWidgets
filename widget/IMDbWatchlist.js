var WidgetMetadata = {
  id: "IMDbWatchlist",
  title: "IMDb Watchlist",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 使用者 Watchlist 頁面，提取 IMDb ID",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      title: "IMDb Watchlist",
      requiresWebView: false,
      functionName: "loadImdbWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "用戶ID",
          type: "input",
          description: "IMDb 使用者 ID，例如 ur12345678",
        },
        {
          name: "page",
          title: "頁碼",
          type: "page",
        }
      ],
    }
  ]
};
async function loadImdbWatchlist(params = {}) {
  const userId = params.user_id;
  const page = params.page || 1;
  const pageSize = 100;
  const start = (page - 1) * pageSize + 1;

  if (!userId) throw new Error("必須提供 IMDb 使用者 ID，例如 ur12345678");

  const url = `https://www.imdb.com/user/${userId}/watchlist?start=${start}`;

  const response = await Widget.http.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
  });

  const imdbIds = extractImdbIdsFromWatchlist(response.data);
  return imdbIds.map(id => ({ id, type: "imdb" }));
}
function extractImdbIdsFromWatchlist(html) {
  const docId = Widget.dom.parse(html);
  const elements = Widget.dom.select(docId, 'div.lister-item.mode-detail');

  const ids = [];

  for (const el of elements) {
    const link = Widget.dom.select(el, 'h3.lister-item-header a')[0];
    if (!link) continue;

    const href = Widget.dom.attr(link, 'href');
    const match = href.match(/\/title\/(tt\d+)/);
    if (match) ids.push(match[1]);
  }

  return [...new Set(ids)];
}
