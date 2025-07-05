var WidgetMetadata = {
  id: "tmdb",
  title: "TMDB 熱門電影榜（免 API）",
  description: "從 TMDB 網頁解析熱門電影資料，支援類型與地區篩選",
  author: "Forward",
  site: "https://www.themoviedb.org/",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      title: "熱門電影榜",
      description: "免 API 爬取 TMDB 熱門電影榜，支援篩選",
      requiresWebView: false,
      functionName: "loadPopularMoviesHTML",
      sectionMode: false,
      cacheDuration: 21600,
      params: [
        {
          name: "with_genres",
          title: "類型",
          type: "enumeration",
          description: "篩選電影類型",
          value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "動作", value: "28" },
            { title: "喜劇", value: "35" },
            { title: "動畫", value: "16" },
            { title: "愛情", value: "10749" },
            { title: "懸疑 / 驚悚", value: "53" },
            { title: "科幻", value: "878" },
            { title: "恐怖", value: "27" },
            { title: "紀錄片", value: "99" }
          ]
        },
        {
          name: "region",
          title: "地區",
          type: "enumeration",
          description: "篩選出品地區 / 國家",
          value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "美國", value: "US" },
            { title: "日本", value: "JP" },
            { title: "韓國", value: "KR" },
            { title: "台灣", value: "TW" },
            { title: "中國", value: "CN" },
            { title: "法國", value: "FR" },
            { title: "英國", value: "GB" }
          ]
        }
      ]
    }
  ]
};

async function loadPopularMoviesHTML(params) {
  const { with_genres = "all", region = "all" } = params;
  const url = "https://www.themoviedb.org/movie";
  const html = await (await fetch(url)).text();

  const items = [];
  const regex = /<a href="\/movie\/(\d+)-[^"]+"[^>]*>\s*<div class="image_content">[\s\S]*?<img[^>]+?data-src="([^"]+)"[^>]*alt="([^"]+)"[\s\S]*?<p class="[^"]*?release_date[^"]*?">([^<]*)<\/p>[\s\S]*?<div class="[^"]*?vote_average[^"]*?">([^<]*)<\/div>[\s\S]*?<p class="genres">([^<]*)<\/p>/g;

  const genreMap = {
    "28": "Action",
    "35": "Comedy",
    "16": "Animation",
    "10749": "Romance",
    "53": "Thriller",
    "878": "Science Fiction",
    "27": "Horror",
    "99": "Documentary"
  };

  const regionMap = {
    US: "USA",
    JP: "Japan",
    KR: "Korea",
    TW: "Taiwan",
    CN: "China",
    FR: "France",
    GB: "UK"
  };

  let match;
  while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    const image = match[2].startsWith("http") ? match[2] : `https://www.themoviedb.org${match[2]}`;
    const title = match[3].trim();
    const releaseDate = match[4].trim();
    const voteAverage = match[5].trim();
    const genreText = match[6].trim();

    let display = true;

    // 類型過濾
    if (with_genres !== "all") {
      const filterGenre = genreMap[with_genres];
      if (!genreText.toLowerCase().includes(filterGenre.toLowerCase())) {
        display = false;
      }
    }

    // 地區過濾（粗略比對標題關鍵字）
    if (region !== "all") {
      const regionKeyword = regionMap[region];
      if (!title.toLowerCase().includes(regionKeyword.toLowerCase())) {
        display = false;
      }
    }

    if (display) {
      items.push({
        title,
        subtitle: `評分：${voteAverage}｜上映日：${releaseDate}`,
        description: genreText,
        image,
        link: `https://www.themoviedb.org/movie/${id}`
      });
    }
  }

  return items;
}
