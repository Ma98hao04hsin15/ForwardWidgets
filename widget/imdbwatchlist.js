// IMDb Watchlist组件
const WidgetMetadata = {
  id: "IMDbWatchlist",
  title: "IMDb Watchlist",
  description: "通过抓取IMDb用户的Watchlist页面，解析出影片IMDb ID，无需API Key",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  author: "YourName",
  site: "https://github.com/yourgithubrepo",
  modules: [
    {
      title: "IMDb用户想看列表",
      requiresWebView: false,
      functionName: "loadWatchlistItems",
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "IMDb 用户ID",
          type: "input",
          description: "IMDb用户ID，如ur204635540，必须填写，否则接口不可用",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
          description: "分页，默认每页解析100条",
        },
      ],
    },
  ],
};
/**
 * 解析IMDb Watchlist页面HTML，提取IMDb ID列表
 * @param {string} html IMDb Watchlist页面HTML内容
 * @returns {string[]} IMDb ID数组，如["tt1234567", "tt7654321"]
 */
function extractImdbIdsFromWatchlistHtml(html) {
  const doc = Widget.dom.parse(html);
  // IMDb Watchlist每个影片通常在 data-tconst 属性里
  const itemElements = Widget.dom.select(doc, 'div.lister-item[data-tconst]');
  if (!itemElements || itemElements.length === 0) {
    throw new Error("未找到任何Watchlist影片元素");
  }
  const imdbIds = itemElements
    .map(el => el.getAttribute('data-tconst') || Widget.dom.attr(el, 'data-tconst'))
    .filter(Boolean);
  return imdbIds;
}

/**
 * 根据IMDb用户ID和页码，抓取Watchlist页面并解析出IMDb ID列表
 * @param {Object} params 参数对象
 * @param {string} params.user_id IMDb用户ID，如 ur204635540
 * @param {number} params.page 页码，从1开始
 * @returns {Promise<{id: string, type: string}[]>} 返回 IMDb ID 列表对象数组
 */
async function loadWatchlistItems(params = {}) {
  try {
    const userId = params.user_id || "";
    const page = params.page || 1;
    if (!userId) {
      throw new Error("必须提供IMDb用户ID");
    }

    // IMDb Watchlist默认每页100条，可通过start参数分页，start从0开始递增100
    const start = (page - 1) * 100;

    // 构造Watchlist URL，注意区分普通Watchlist和私人Watchlist，普通是：
    // https://www.imdb.com/user/{userId}/watchlist?sort=added&mode=detail&start={start}
    // 这里以公开Watchlist为例
    const url = `https://www.imdb.com/user/${userId}/watchlist?sort=added&mode=detail&start=${start}`;

    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    const imdbIds = extractImdbIdsFromWatchlistHtml(response.data);

    // 返回格式，和Trakt模块保持一致
    return imdbIds.map(id => ({
      id,
      type: "imdb",
    }));
  } catch (error) {
    console.error("IMDb Watchlist处理失败:", error);
    throw error;
  }
}
