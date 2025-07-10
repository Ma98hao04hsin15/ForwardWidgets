// forward.imdb.watchlist.js

const axios = require("axios");
const cheerio = require("cheerio");

// ======= Widget Metadata =======
const WidgetMetadata = {
  id: "imdb.watchlist",
  title: "IMDb Watchlist",
  description: "根据 IMDb 用户 ID 获取其 Watchlist 片单内容，无需 API Key",
  author: "Joey",
  site: "https://www.imdb.com",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      title: "我的 Watchlist",
      description: "通过 IMDb 用户 ID 获取 Watchlist 内容",
      requiresWebView: false,
      functionName: "loadImdbWatchlist",
      sectionMode: false,
      cacheDuration: 3600,
      params: [
        {
          name: "userId",
          title: "IMDb 用户 ID",
          type: "input",
          description: "例如：ur204635540，可在 IMDb 个人资料页 URL 中找到",
          value: ""
        },
        {
          name: "filter",
          title: "内容类型",
          type: "enumeration",
          description: "选择要展示的内容类型",
          value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "电影", value: "movie" },
            { title: "剧集", value: "tv" }
          ]
        },
        {
          name: "sort",
          title: "排序方式",
          type: "enumeration",
          value: "date_added,desc",
          enumOptions: [
            { title: "添加时间（新→旧）", value: "date_added,desc" },
            { title: "添加时间（旧→新）", value: "date_added,asc" },
            { title: "IMDb 评分（高→低）", value: "user_rating,desc" },
            { title: "上映时间（新→旧）", value: "release_date,desc" },
            { title: "标题（A→Z）", value: "alpha,asc" }
          ]
        },
        {
          name: "count",
          title: "数量",
          type: "count",
          value: 30,
          description: "最多加载条目数，默认 30 条"
        }
      ]
    }
  ]
};

// ======= Main Function =======
async function loadImdbWatchlist(params) {
  const {
    userId,
    sort = "date_added,desc",
    filter = "all",
    count = 30
  } = params;

  if (!userId) throw new Error("请提供 IMDb 用户 ID");

  const sortParam = encodeURIComponent(sort);
  const filterParam = filter === "all" ? "" : `&filter=${filter}`;
  const url = `https://www.imdb.com/user/${userId}/watchlist?sort=${sortParam}${filterParam}`;

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const scripts = $("script");

  let jsonText = null;
  scripts.each((_, el) => {
    const content = $(el).html();
    if (content && content.includes("IMDbReactInitialState.push")) {
      const match = content.match(/\{.+\}/);
      if (match) jsonText = match[0];
    }
  });

  if (!jsonText) throw new Error("无法解析 IMDb Watchlist 数据");

  const data = JSON.parse(jsonText);
  const items = data.list?.items || [];

  const result = [];
  for (let i = 0; i < Math.min(items.length, count); i++) {
    const item = items[i];
    const imdbId = item.const;
    const title = item.displayableTitle || item.title;
    const image = item.primaryImage?.url?.split("_V1")[0] + "_V1_UX400.jpg";
    const rating = item.rating?.value || null;
    const releaseDate = item.releaseDate || "";
    const year = releaseDate.slice(0, 4);

    // 如需平台筛选可调用 fetchTmdbInfoByImdbId(imdbId)
    result.push({
      id: imdbId,
      title: title,
      subtitle: `${year || ""}${rating ? " · ⭐" + rating : ""}`,
      image: image,
      jumpUrl: `https://www.imdb.com/title/${imdbId}/`
    });
  }

  return result;
}

// ======= Utility Functions =======
async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.117 Safari/537.36",
    },
  });
  return res.data;
}

// 可选：IMDb ID → TMDB 信息（包含平台）
async function fetchTmdbInfoByImdbId(imdbId) {
  // 你可替换为内部无 API Key 的 TMDB 映射逻辑，例如 forward.tmdb.fetchByImdb()
  return {}; // 预留结构
}

// ======= 导出 =======
module.exports = {
  WidgetMetadata,
  loadImdbWatchlist
};
