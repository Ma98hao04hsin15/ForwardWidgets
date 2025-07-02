WidgetMetadata = {
  id: "TraktWatchlist",
  title: "Trakt Watchlist",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "从 Trakt 用户 Watchlist 页面抓取影片数据，无需 API Key",
  author: "Forward",
  site: "https://trakt.tv",
  modules: [
    {
      id: "traktWatchlist",
      title: "Trakt 想看清单",
      requiresWebView: false,
      functionName: "loadTraktWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "user_name",
          title: "用户名",
          type: "input",
          default: "joy98ma0415",
          required: true,
          description: "Trakt 用户名"
        }
      ]
    }
  ]
};

/**
 * 从 Trakt 用户 Watchlist 页面抓取想看清单
 * @param {Object} params - 函数参数
 * @param {string} params.user_name - Trakt 用户名
 * @returns {Promise<Array>} 影片列表
 */
async function loadTraktWatchlist({ user_name }) {
  const url = `https://trakt.tv/users/${user_name}/watchlist?sort=rank,asc`;

  // fetchText 是 Forward 框架內建的簡單 fetch 文本函數
  const html = await fetchText(url);

  // 使用正則從 HTML 中擷取影片資訊
  const items = [];
  const regex = /<div class=".*?grid-item.*?".*?data-type="(movie|show)".*?data-title="(.*?)".*?data-year="(\d{4})".*?data-slug="(.*?)".*?<img.*?src="(.*?)"/gs;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const [, type, title, year, slug, image] = match;
    items.push({
      title: `${title} (${year})`,
      image,
      url: `https://trakt.tv/${type}s/${slug}`
    });
  }

  return items;
}
