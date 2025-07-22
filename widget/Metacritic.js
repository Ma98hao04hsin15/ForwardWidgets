WidgetMetadata = {
  id: "metacritic",
  title: "Metacritic 分類榜單",
  description: "依照電影類型抓取 Metacritic 榜單，支援熱門分類 Top N",
  author: "YourName",
  site: "https://www.metacritic.com",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 86400, // 詳情快取時間：1 天
  modules: [
    {
      title: "分類最高電影",
      description: "根據選定類型顯示 Metascore 前幾名電影",
      requiresWebView: false,
      functionName: "fetchGenreTop",
      sectionMode: false,
      cacheDuration: 3600,
      params: [
        {
          name: "genre",
          title: "分類",
          type: "enumeration",
          description: "選擇電影類型",
          value: "all",
          enumOptions: [
            { title: "全部／All", value: "all" },
            { title: "動作／Action", value: "action" },
            { title: "冒險／Adventure", value: "adventure" },
            { title: "動畫／Animation", value: "animation" },
            { title: "喜劇／Comedy", value: "comedy" },
            { title: "犯罪／Crime", value: "crime" },
            { title: "劇情／Drama", value: "drama" },
            { title: "恐怖／Horror", value: "horror" },
            { title: "科幻／Sci‑Fi", value: "sci_fi" },
            { title: "奇幻／Fantasy", value: "fantasy" },
            { title: "愛情／Romance", value: "romance" },
            { title: "驚悚／Thriller", value: "thriller" }
          ]
        },
        {
          name: "limit",
          title: "顯示數量",
          type: "count",
          description: "要顯示的電影數量（預設 10）",
          value: 10
        }
      ]
    }
  ]
};

// 🎬 模組主函數：依分類抓取榜單
async function fetchGenreTop(params = {}) {
  const genre = params.genre || "all";
  const limit = params.limit || 10;

  const url = genre === "all"
    ? "https://www.metacritic.com/browse/movie/"
    : `https://www.metacritic.com/browse/movie/genre/date/metascore?genres=${genre}`;

  const response = await Widget.http.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.metacritic.com"
    }
  });

  const $ = Widget.html.load(response.data);
  const items = [];

  $(".browse_list_wrapper .clamp-summary-wrap").slice(0, limit).each((i, el) => {
    const title = $(el).find("h3").text().trim();
    const score = $(el).find(".metascore_w").first().text().trim();
    const date = $(el).find(".clamp-details span").first().text().trim();
    const rel = $(el).find("a.title").attr("href");
    const link = "https://www.metacritic.com" + rel;

    items.push({
      id: link,
      type: "url",
      title,
      rating: score,
      releaseDate: date,
      link
    });
  });

  return items;
}

// 📄 詳情解析函數（點選影片後呼叫）
async function loadDetail(item) {
  const resp = await Widget.http.get(item.link, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.metacritic.com"
    }
  });

  const $ = Widget.html.load(resp.data);

  return {
    videoUrl: null,
    posterPath: $(".product_image img").attr("src"),
    description: $(".summary_detail.product_summary").text().trim(),
    genreTitle: $(".genres .data").text().trim(),
    childItems: [],
    additional: {
      director: $(".director span.data").text().trim(),
      runtime: $(".runtime .data").text().trim(),
      metascore: $(".metascore_w.xlarge.movie").text().trim()
    }
  };
}
