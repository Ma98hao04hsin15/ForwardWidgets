var WidgetMetadata = {
  id: "IMDbWatchlist",
  title: "IMDb Watchlist",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 用户 Watchlist 页面获取 IMDb ID、标题与封面，无需 API Key",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      title: "IMDb Watchlist",
      description: "支持分页与排序的 IMDb Watchlist 抓取组件",
      requiresWebView: false,
      functionName: "loadImdbWatchlistItems",
      cacheDuration: 21600,
      params: [
        {
          name: "user_id",
          title: "IMDb 用户 ID",
          type: "input",
          description: "例如：ur204635540，可在 IMDb 用户主页网址中找到"
        },
        {
          name: "sort",
          title: "排序方式",
          type: "select",
          options: [
            { title: "默认排序", value: "" },
            { title: "标题 A-Z", value: "title,asc" },
            { title: "添加时间（新→旧）", value: "date_added,desc" },
            { title: "添加时间（旧→新）", value: "date_added,asc" }
          ]
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        }
      ]
    }
  ]
};

async function loadImdbWatchlistItems(params = {}) {
  try {
    const page = params.page || 1;
    const userId = params.user_id;
    const sort = params.sort || "";
    const count = 20;
    const start = (page - 1) * count + 1;

    if (!userId) throw new Error("必须提供 IMDb 用户 ID");

    const url = `https://www.imdb.com/user/${userId}/watchlist?start=${start}${sort ? `&sort=${sort}` : ""}`;
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const doc = Widget.dom.parse(response.data);
    const elements = Widget.dom.select(doc, 'div.lister-item');

    const items = elements.map(el => {
      const link = Widget.dom.select(el, 'h3.lister-item-header a')[0];
      const href = link && Widget.dom.attr(link, 'href');
      const match = href?.match(/\/title\/(tt\d+)/);
      const title = link?.textContent.trim() || "";
      const posterEl = Widget.dom.select(el, '.lister-item-image img')[0];
      const poster = posterEl && (Widget.dom.attr(posterEl, 'loadlate') || Widget.dom.attr(posterEl, 'src'));

      if (match) {
        return {
          id: match[1],
          type: "imdb",
          title,
          poster
        };
      }
      return null;
    }).filter(Boolean);

    // 获取总条目数（用于分页）
    const totalText = Widget.dom.select(doc, '.desc')[0]?.textContent || '';
    const totalMatch = totalText.replace(/,/g, '').match(/of\s+(\d+)/i);
    const totalResults = totalMatch ? parseInt(totalMatch[1], 10) : page * count;

    return {
      total: totalResults,
      data: items
    };
  } catch (error) {
    console.error("IMDb Watchlist 抓取失败:", error);
    throw error;
  }
}
