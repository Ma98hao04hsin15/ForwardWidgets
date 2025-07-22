var WidgetMetadata = {
  id: "MetacriticMovies",
  title: "Metacritic 電影榜單",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "抓取 Metacritic 電影榜單，可指定年份與類型",
  author: "HAO HSIN MA & ChatGPT",
  site: "https://www.metacritic.com/",
  cacheDuration: 21600,
  modules: [
    {
      title: "Metacritic 電影榜單",
      functionName: "loadMetacriticList",
      params: [
        { name: "year", title: "年份（例如2024、2023）", required: false },
        { name: "page", title: "頁數", default: 1 },
      ]
    }
  ]
};

async function loadMetacriticList(params) {
  const year = params.year || "current-year"; // current-year / all-time / 2023 ...
  const page = parseInt(params.page) || 1;
  const url = `https://www.metacritic.com/browse/movie/all/all/${year}?page=${page - 1}`;

  const html = await fetchTextWithUA(url);
  const list = [];

  const itemRegex = /<a href="\/movie\/([^"]+)"[^>]*>(.*?)<\/a>[\s\S]*?class="[^"]*product_year[^"]*">([^<]*)<[\s\S]*?class="[^"]*metascore_w[^"]*">([^<]*)/g;
  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const slug = match[1];
    const title = match[2].trim();
    const yearText = match[3].trim();
    const score = match[4].trim();

    const detailUrl = `https://www.metacritic.com/movie/${slug}`;
    const imdb_id = await fetchIMDbIdFromMetacriticPage(detailUrl);

    list.push({
      title: title,
      year: parseInt(yearText),
      rating: score,
      imdb_id: imdb_id,
      poster: `https://cdn.metacritic.com/movie/${slug}/poster.jpg` // 預設封面結構，若無法使用可改抓 TMDB
    });
  }

  return list;
}

async function fetchTextWithUA(url) {
  return await $fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    }
  });
}

async function fetchIMDbIdFromMetacriticPage(url) {
  const html = await fetchTextWithUA(url);
  const imdbMatch = html.match(/href="https:\/\/www.imdb.com\/title\/(tt\d{7,8})/);
  return imdbMatch ? imdbMatch[1] : null;
}
