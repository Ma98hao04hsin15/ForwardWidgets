var WidgetMetadata = {
  id: "metacritic.tv",
  title: "Metacritic TV",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "获取 Metacritic TV 热门和高分剧集",
  author: "Forward",
  site: "https://www.metacritic.com/tv/",
  modules: [
    {
      id: "trending",
      title: "本週熱門劇集",
      requiresWebView: false,
      functionName: "loadMetacriticTrending",
      cacheDuration: 21600
    },
    {
      id: "bestof2025",
      title: "2025 高分劇集",
      requiresWebView: false,
      functionName: "loadMetacriticBestOf",
      cacheDuration: 21600
    }
  ]
};

// 解析 Metacritic TV 首頁「Trending Shows This Week」
async function loadMetacriticTrending() {
  const url = "https://www.metacritic.com/tv/";
  const html = await loadText(url);
  const list = [];

  const regex = /<a href="(\/tv\/[^"]+)"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>[\s\S]*?class="c-siteReviewScore"[^>]*>(\d+)<\/span>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const link = "https://www.metacritic.com" + match[1];
    const title = match[2].trim();
    const score = match[3].trim();

    list.push({
      title: `${title} (${score})`,
      url: link
    });
  }

  return list.slice(0, 10);
}

// 解析 2025 年度高分劇集榜單
async function loadMetacriticBestOf() {
  const url = "https://www.metacritic.com/pictures/the-20-best-new-tv-shows-of-2025-so-far/";
  const html = await loadText(url);
  const list = [];

  const regex = /<h3[^>]*>(\d+)\. ([^<]+)<\/h3>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?Metascore[^>]*?(\d+)/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const rank = match[1];
    const title = match[2].trim();
    const image = match[3];
    const score = match[4];

    list.push({
      title: `${rank}. ${title} (${score})`,
      image: image,
      url: "https://www.metacritic.com/pictures/the-20-best-new-tv-shows-of-2025-so-far/"
    });
  }

  return list;
}
