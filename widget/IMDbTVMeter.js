const WidgetMetadata = {
  id: "IMDbTVMeter",
  title: "IMDb 熱門電視排行榜",
  description: "從 IMDb TV Meter 頁面抓取熱門電視節目，無需 API Key，支持年份篩選",
  requiresWebView: false,
  cacheDuration: 3600,
  params: [
    {
      name: "year",
      title: "年份篩選",
      type: "input",
      placeholder: "輸入年份 (選填)",
      description: "只顯示指定年份的節目",
    },
  ],
};

async function fetchWithRetry(url, options = {}, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function loadIMDbTVMeter(params) {
  const yearFilter = params?.year?.trim();
  const url = "https://www.imdb.com/chart/tvmeter/";

  let html;
  try {
    const res = await fetchWithRetry(url);
    html = await res.text();
  } catch (err) {
    throw new Error(`無法取得 IMDb TV Meter 頁面: ${err.message}`);
  }

  const trRegex = /<tr>([\s\S]*?)<\/tr>/g;
  let match;
  const items = [];

  while ((match = trRegex.exec(html)) !== null) {
    const trHtml = match[1];

    const imdbIdMatch = trHtml.match(/href="\/title\/(tt\d+)\//);
    const imdbId = imdbIdMatch ? imdbIdMatch[1] : null;
    if (!imdbId) continue;

    const titleMatch = trHtml.match(/<a href="\/title\/tt\d+\/"[^>]*>([^<]+)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const yearMatch = trHtml.match(/<span class="secondaryInfo">\((\d{4})\)<\/span>/);
    const year = yearMatch ? yearMatch[1] : "";

    const ratingMatch = trHtml.match(/<td class="imdbRating">[\s\S]*?<strong[^>]*>([\d.]+)<\/strong>/);
    const rating = ratingMatch ? ratingMatch[1] : null;

    const posterMatch = trHtml.match(/<td class="posterColumn">[\s\S]*?<img[^>]+src="([^"]+)"/);
    const poster = posterMatch ? posterMatch[1] : null;

    if (yearFilter && year !== yearFilter) continue;

    items.push({
      imdbId,
      title,
      year,
      rating,
      poster,
    });
  }

  if (items.length === 0) {
    throw new Error(yearFilter ? `找不到 ${yearFilter} 年的熱門節目` : "找不到熱門節目資料");
  }

  return { data: items };
}

export { WidgetMetadata, loadIMDbTVMeter };
