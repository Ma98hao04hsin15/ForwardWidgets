WidgetMetadata = {
  id: "imdb.tvmeter",
  title: "IMDb 热门电视剧榜",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "抓取 IMDb 当前最受欢迎的电视剧（tvmeter 榜单）",
  author: "Forward",
  site: "https://www.imdb.com/chart/tvmeter/",
  modules: [
    {
      title: "IMDb 热门电视剧榜",
      requiresWebView: false,
      functionName: "loadImdbTvMeterItems",
      cacheDuration: 43200,
      params: []
    }
  ]
};
async function loadImdbTvMeterItems() {
  const url = "https://www.imdb.com/chart/tvmeter/?ref_=hm_nv_menu&sort=rank%2Casc";

  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache",
      },
    });

    const doc = Widget.dom.parse(response.data);
    const rows = Widget.dom.select(doc, ".ipc-metadata-list-summary-item__t"); // 每个电视剧卡片

    const items = [];

    for (const row of rows) {
      const link = Widget.dom.selectOne(row, 'a[href^="/title/tt"]');
      const href = link?.getAttribute?.("href") || Widget.dom.attr(link, "href");
      const match = href?.match(/\/title\/(tt\d+)/);
      if (match) {
        items.push({
          id: match[1],
          type: "imdb",
        });
      }
    }

    if (!items.length) {
      throw new Error("未能抓取到任何 IMDb 热门电视剧数据，可能页面结构已变更。");
    }

    return items;
  } catch (error) {
    console.error("IMDb 热门电视剧榜抓取失败:", error);
    throw error;
  }
}
