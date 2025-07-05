WidgetMetadata = {
  id: "imdb.tvchart",
  title: "IMDb 电视节目排行榜",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 电视节目排行榜，支持提取 IMDb ID 和节目信息",
  author: "Forward",
  site: "https://www.imdb.com/chart/tvmeter/",
  modules: [
    {
      title: "IMDb 电视节目排行榜",
      requiresWebView: false,
      functionName: "loadImdbTvChartItems",
      cacheDuration: 86400,
      params: [
        {
          name: "includeDetails",
          title: "包含详细信息",
          type: "boolean",
          defaultValue: false,
          description: "是否包含节目标题、排名等信息"
        }
      ]
    }
  ]
};

async function loadImdbTvChartItems(params = {}) {
  const includeDetails = params.includeDetails || false;
  const url = "https://www.imdb.com/chart/tvmeter/";

  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      },
      timeout: 10000
    });

    if (!response.data) {
      throw new Error("Empty response from IMDb");
    }

    const doc = Widget.dom.parse(response.data);
    const items = [];
    const seenIds = new Set();

    // Process each TV show entry
    const rows = Widget.dom.select(doc, '.ipc-metadata-list-summary-item');

    rows.forEach(row => {
      const linkElement = Widget.dom.select(row, 'a.ipc-title-link-wrapper')[0];
      if (!linkElement) return;
      
      const href = linkElement.getAttribute?.("href") || Widget.dom.attr(linkElement, "href");
      const match = href.match(/\/title\/(tt\d+)/);
      if (!match) return;
      
      const imdbId = match[1];
      if (seenIds.has(imdbId)) return;
      
      seenIds.add(imdbId);
      
      const item = {
        id: imdbId,
        type: "imdb_tv"
      };
      
      if (includeDetails) {
        // Get title and rank
        const titleElement = Widget.dom.select(row, 'h3.ipc-title__text')[0];
        if (titleElement) {
          const titleText = titleElement.textContent?.trim() || Widget.dom.text(titleElement).trim();
          // Remove ranking number from title
          item.title = titleText.replace(/^\d+\.\s*/, '');
        }
        
        // Get additional metadata (year, rating, etc.)
        const metadataElements = Widget.dom.select(row, '.sc-b189961a-8');
        if (metadataElements.length > 0) {
          item.metadata = metadataElements.map(el => 
            el.textContent?.trim() || Widget.dom.text(el).trim()
          ).join(' | ');
        }
      }
      
      items.push(item);
    });

    return items;
  } catch (error) {
    console.error("IMDb 电视节目排行榜抓取失败:", error);
    throw new Error(`Failed to fetch IMDb TV chart: ${error.message}`);
  }
}
