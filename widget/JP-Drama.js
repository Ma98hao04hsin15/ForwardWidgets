WidgetMetadata = {
  id: "imdb.trending.tv.platform",
  title: "IMDb 熱門電視劇榜（平台篩選）",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 熱門電視劇排行榜，支援日期與播放平台篩選",
  author: "Forward",
  site: "https://www.imdb.com/chart/tvmeter/",
  modules: [
    {
      title: "IMDb 熱門 TV 榜 + 平台過濾",
      requiresWebView: false,
      functionName: "loadImdbTrendingTVItemsWithPlatform",
      cacheDuration: 86400,
      params: [
        {
          name: "date",
          title: "日期標記（YYYY-MM-DD）",
          type: "input",
          description: "僅用於標記該批榜單的日期"
        },
        {
          name: "platform",
          title: "播放平台",
          type: "enumeration",
          enumOptions: [
            { title: "不限", value: "" },
            { title: "Netflix", value: "Netflix" },
            { title: "Disney+", value: "Disney" },
            { title: "Apple TV+", value: "Apple" },
            { title: "Amazon", value: "Amazon" },
            { title: "HBO / Max", value: "HBO" },
            { title: "Hulu", value: "Hulu" },
            { title: "Paramount+", value: "Paramount" }
          ],
          description: "可選擇特定平台，如 Netflix"
        }
      ]
    }
  ]
};

async function loadImdbTrendingTVItemsWithPlatform(params = {}) {
  const date = params.date || new Date().toISOString().split('T')[0];
  const platform = (params.platform || "").toLowerCase();
  const url = "https://www.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv";

  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const doc = Widget.dom.parse(response.data);
    const rows = Widget.dom.select(doc, ".lister-list tr");

    const items = [];

    for (const row of rows) {
      const link = Widget.dom.select(row, 'td.titleColumn a[href^="/title/tt"]')[0];
      if (!link) continue;

      const title = Widget.dom.text(link)?.trim();
      const href = link.getAttribute?.("href") || Widget.dom.attr(link, "href");
      const match = href.match(/\/title\/(tt\d+)/);
      const imdbId = match ? match[1] : null;

      if (!imdbId) continue;

      let platformMatch = true;

      if (platform) {
        // 訪問主頁分析播放平台
        const detailUrl = `https://www.imdb.com/title/${imdbId}/`;
        try {
          const detailRes = await Widget.http.get(detailUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Accept-Language": "en-US,en;q=0.9"
            }
          });

          const detailDoc = Widget.dom.parse(detailRes.data);
          const pageText = detailRes.data.toLowerCase();

          // 用 HTML 中的關鍵字簡易判斷
          platformMatch = pageText.includes(platform);
        } catch (err) {
          console.warn(`獲取 ${imdbId} 主頁失敗:`, err);
          platformMatch = false;
        }
      }

      if (platformMatch) {
        items.push({
          id: imdbId,
          type: "imdb",
          title,
          date,
          platform: platform || "all"
        });
      }
    }

    return items;
  } catch (err) {
    console.error("解析 IMDb TVMeter 頁面時失敗:", err);
    return [];
  }
}
