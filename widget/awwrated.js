// Netflix / Disney+ 避雷榜单
WidgetMetadata = 
  {
  id:"awwrated",
  title: "串流避雷精选",
  description: "从 awwrated 获取 Netflix/Disney+ 的热度、即将下架、编辑推荐等信息",
  requiresWebView: false,
  functionName: "getAwwRatedStream",
  cacheDuration: 3600,
  params: [
    {
      name: "platform",
      title: "平台",
      type: "enumeration",
      enumOptions: [
        { title: "Netflix", value: "netflix" },
        { title: "Disney+", value: "disney" }
      ]
    },
    {
      name: "category",
      title: "类别",
      type: "enumeration",
      enumOptions: [
        { title: "熱門趨勢", value: "trend" },
        { title: "即將下架", value: "leaving" },
        { title: "編輯推薦", value: "editor" }
      ]
    },
    {
      name: "timeframe",
      title: "時間週期",
      type: "enumeration",
      enumOptions: [
        { title: "今日", value: "daily" },
        { title: "本週", value: "weekly" },
        { title: "本月", value: "monthly" },
        { title: "總榜", value: "alltime" }
      ]
    },
    {
      name: "region",
      title: "地區篩選",
      type: "enumeration",
      enumOptions: [
        { title: "全部／全球", value: "" },
        { title: "美國", value: "USA" },
        { title: "台灣", value: "Taiwan" },
        { title: "韓國", value: "Korea" },
        { title: "日本", value: "Japan" },
        { title: "英國", value: "UK" },
        { title: "中國", value: "China" }
      ]
    },
    {
      name: "genre",
      title: "類型",
      type: "enumeration",
      enumOptions: [
        { title: "全部", value: "" },
        { title: "劇情", value: "Drama" },
        { title: "喜劇", value: "Comedy" },
        { title: "驚悚", value: "Thriller" },
        { title: "懸疑", value: "Mystery" },
        { title: "科幻", value: "Sci-Fi" },
        { title: "動作", value: "Action" },
        { title: "恐怖", value: "Horror" },
        { title: "紀錄片", value: "Documentary" },
        { title: "動畫", value: "Anime" },
        { title: "家庭", value: "Family" }
      ]
    },
    {
      name: "offset",
      title: "起始位置",
      type: "offset"
    }
  ]
};


async function getAwwRatedStream(params = {}) {
  const { platform="netflix", category="trend", timeframe="daily", region="", genre="", offset=0 } = params;
  const base = "https://awwrated.com/zh-tw";
  let path = "";

  if (category === "trend") {
    path = `/${platform}`; // 例如 "/netflix"，会显示多种热门趋势（日／週／月／總榜）
  } else if (category === "leaving") {
    path = `/leaving-soon`; // 即將下架页面
  } else if (category === "editor") {
    path = `/zh-tw/netflix/editorial`;//如果编辑推荐有独立页面
  }

  const url = `${base}${path}`;
  const res = await Widget.http.get(url, {
    headers: { "User-Agent": USER_AGENT }
  });

  // 解析 HTML，提取列表项：标题、评分、类型、地区、总结、到期日等信息；
  // 此处建议用正则或 DOM 解析进行抽取
  const items = parseAwwRatedHTML(res.data, {category, timeframe, region, genre});
  return items.slice(offset, offset + 20); // 分页
}
function parseAwwRatedHTML(html, options = {}) {
  const items = [];
  // 解析大致思路：
  // 1. 先找出所有影视条目块（用 <article> 或 <div class="card"> 之类）
  // 2. 针对每个条目块，用正则抽取标题、评分、类型、简介等信息
  // 3. 过滤 genre 和 region，如果参数里有对应筛选

  // 注意：awwrated 页面结构随时可能变更，这里用较通用的标签和class名示例

  // 示例：影视条目用 <article class="card"> 或 <div class="card"> 包裹
  // 下面正则匹配所有 <article ...> ... </article>
  const articleRegex = /<article[^>]*class=["']card["'][^>]*>([\s\S]*?)<\/article>/gi;
  let match;
  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1];

    // 标题 - 通常是 <h2 class="card-title">标题</h2>
    const titleMatch = /<h2[^>]*class=["']card-title["'][^>]*>([^<]+)<\/h2>/i.exec(block);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    // 评分 - 可能存在 <div class="rating">8.3</div> 或类似
    const scoreMatch = /<div[^>]*class=["']rating["'][^>]*>([\d\.]+)<\/div>/i.exec(block);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

    // 类型 - 可能是 <div class="genres"><a>动作</a>, <a>悬疑</a></div>
    const genresMatch = /<div[^>]*class=["']genres["'][^>]*>([\s\S]*?)<\/div>/i.exec(block);
    let genres = [];
    if (genresMatch) {
      const genreAnchorRegex = /<a[^>]*>([^<]+)<\/a>/g;
      let gmatch;
      while ((gmatch = genreAnchorRegex.exec(genresMatch[1])) !== null) {
        genres.push(gmatch[1].trim());
      }
    }

    // 简介 - 可能是 <p class="summary">...</p>
    const summaryMatch = /<p[^>]*class=["']summary["'][^>]*>([^<]+)<\/p>/i.exec(block);
    const summary = summaryMatch ? summaryMatch[1].trim() : "";

    // 上映/到期时间 - <time datetime="2023-08-01">2023/08/01</time>
    const dateMatch = /<time[^>]*datetime=["']([\d-]+)["'][^>]*>/i.exec(block);
    const date = dateMatch ? dateMatch[1] : null;

    // 海报图 - <img src="..." alt="..."/>
    const posterMatch = /<img[^>]*src=["']([^"']+)["'][^>]*class=["']card-poster["'][^>]*>/i.exec(block);
    const poster = posterMatch ? posterMatch[1] : "";

    // 影视详情链接（可能含 IMDb 或 TMDB id）
    const linkMatch = /<a[^>]*href=["']([^"']+)["'][^>]*class=["']card-link["'][^>]*>/i.exec(block);
    const link = linkMatch ? linkMatch[1] : "";

    // 可以尝试从 link 解析 imdb_id 或 tmdb_id（如果 url 包含 imdb.com/title 或 tmdb id）
    let imdbId = null, tmdbId = null;
    if (link) {
      const imdbMatch = /imdb\.com\/title\/(tt\d{7,8})/.exec(link);
      if (imdbMatch) imdbId = imdbMatch[1];

      const tmdbMatch = /themoviedb\.org\/(movie|tv)\/(\d+)/.exec(link);
      if (tmdbMatch) tmdbId = tmdbMatch[2];
    }

    // 参数筛选 genre & region (region 不好从页面解析，先不做)
    if (options.genre && options.genre !== "" && !genres.includes(options.genre)) {
      continue;
    }

    // 构造条目对象
    items.push({
      title,
      score,
      genres,
      summary,
      date,
      poster,
      link,
      imdbId,
      tmdbId
    });
  }

  return items;
}

async function getAwwRatedStreamFromCache(params = {}) {
  const platform = params.platform || "netflix";
  const offset = Number(params.offset) || 0;

  // 你的缓存文件 URL（GitHub raw 地址示范）
  const cacheUrl = `https://raw.githubusercontent.com/Ma98hao04hsin15/ForwardWidgets/main/cache/${platform}.html`;

  const res = await Widget.http.get(cacheUrl, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (!res || !res.data) throw new Error("读取缓存失败");

  const items = parseAwwRatedHTML(res.data, params);

  return items.slice(offset, offset + 20);
}
