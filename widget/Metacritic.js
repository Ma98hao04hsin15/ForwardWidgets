var WidgetMetadata = {
  id: "metacritic",
  title: "Metacritic 電影排行榜",
  description: "抓取 Metacritic 當前年度及歷年最佳電影排行榜，支持查看影片詳情",
  author: "YourName",
  site: "https://www.metacritic.com",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 86400,  // 詳細頁快取一天
  modules: [
    {
      title: "年度最佳電影",
      description: "抓取當年度 Metascore 前幾名電影",
      requiresWebView: false,
      functionName: "fetchThisYearTop",
      sectionMode: false,
      cacheDuration: 3600,
      params: [
        {
          name: "limit",
          title: "顯示數量",
          type: "count",
          description: "要顯示的電影數量 (預設 10)",
          value: 10
        }
      ]
    },
    {
      title: "史上最佳電影",
      description: "抓取 Metacritic 綜合榜單（Best Movies of All Time）",
      requiresWebView: false,
      functionName: "fetchAllTimeTop",
      sectionMode: false,
      cacheDuration: 3600,
      params: [
        {
          name: "limit",
          title: "顯示數量",
          type: "count",
          description: "要顯示的電影數量 (預設 10)",
          value: 10
        }
      ]
    }
  ],
  search: {
    title: "電影搜尋",
    functionName: "searchMovies",
    params: [
      {
        name: "query",
        title: "電影名稱",
        type: "input",
        description: "輸入要搜索的電影名稱",
        value: ""
      }
    ]
  }
};

async function fetchThisYearTop(params = {}) {
  const limit = params.limit || 10;
  const url = "https://www.metacritic.com/browse/movie/all/all/current-year/metascore";
  const resp = await Widget.http.get(url, {
    headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.metacritic.com" }
  });
  const $ = Widget.html.load(resp.data);
  return $(".browse_list_wrapper .clamp-summary-wrap").slice(0, limit).map((i, el) => {
    const title = $(el).find("h3").text().trim();
    const score = $(el).find(".metascore_w").text().trim();
    const date = $(el).find(".clamp-details span").first().text().trim();
    const rel = $(el).find("a.title").attr("href");
    const link = "https://www.metacritic.com" + rel;
    return {
      id: link,
      type: "url",
      title,
      rating: score,
      releaseDate: date,
      link
    };
  }).get();
}

async function fetchAllTimeTop(params = {}) {
  const limit = params.limit || 10;
  const url = "https://www.metacritic.com/browse/movie/";
  const resp = await Widget.http.get(url, {
    headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.metacritic.com" }
  });
  const $ = Widget.html.load(resp.data);
  return $(".browse_list_wrapper .clamp-summary-wrap").slice(0, limit).map((i, el) => {
    const title = $(el).find("h3").text().trim();
    const score = $(el).find(".metascore_w").text().trim();
    const date = $(el).find(".clamp-details span").first().text().trim();
    const rel = $(el).find("a.title").attr("href");
    const link = "https://www.metacritic.com" + rel;
    return {
      id: link,
      type: "url",
      title,
      rating: score,
      releaseDate: date,
      link
    };
  }).get();
}

async function searchMovies(params = {}) {
  const q = (params.query || "").trim();
  if (!q) throw new Error("請輸入搜尋關鍵字");
  const url = `https://www.metacritic.com/search/movie/${encodeURIComponent(q)}/results`;
  const resp = await Widget.http.get(url, {
    headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.metacritic.com" }
  });
  const $ = Widget.html.load(resp.data);
  return $(".search_results .result").map((i, el) => {
    const title = $(el).find(".product_title a").text().trim();
    const score = $(el).find(".metascore_w").first().text().trim();
    const rel = $(el).find(".product_title a").attr("href");
    const link = "https://www.metacritic.com" + rel;
    const date = $(el).find(".release_date .data").text().trim();
    return { id: link, type: "url", title, rating: score, releaseDate: date, link };
  }).get();
}

async function loadDetail(item) {
  const resp = await Widget.http.get(item.link, {
    headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.metacritic.com" }
  });
  const $ = Widget.html.load(resp.data);
  const poster = $(".product_image img").attr("src");
  const summary = $(".summary_detail.summary_cast").first().text().trim() ||
                  $(".blurb .inline_truncate").text().trim();
  const director = $(".director span.data").text().trim();
  const runtime = $(".runtime .data").text().trim();
  const rating = $(".metascore_w.xlarge.movie").text().trim();
  return {
    videoUrl: null,  // 不提供播放連結
    posterPath: poster,
    description: summary,
    genreTitle: $(".genres .data").text().trim(),
    childItems: [],
    additional: {
      director,
      runtime,
      metascore: rating
    }
  };
}
