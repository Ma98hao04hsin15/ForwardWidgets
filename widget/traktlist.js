WidgetMetadata={
  id: "imdb.calendar",
  title: "IMDb 上映日历",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 不同地区上映时间表，支持提取 IMDb ID",
  author: "Forward",
  site: "https://trakt.tv/users/joy98ma0415/lists/want?sort=rank,asc",
  modules: [
    {
      title: "IMDb 地区上映日历",
      requiresWebView: false,
      functionName: "loadImdbCalendarItems",
      cacheDuration: 86400,
      params: [
        {
          name: "region",
          title: "地区代码",
          type: "enumeration",
          enumOptions: [
            { title: "美国", value: "US" },
            { title: "英国", value: "GB" },
            { title: "日本", value: "JP" },
            { title: "韩国", value: "KR" },
            { title: "台湾", value: "TW" },
            { title: "中国大陆", value: "CN" },
            { title: "香港", value: "HK" },
            { title: "法国", value: "FR" },
            { title: "德国", value: "DE" },
            { title: "印度", value: "IN" },
          ],
          description: "根据 IMDb 地区上映列表抓取 IMDb ID（如 US、JP 等）",
        }
      ]
    }
  ]
};

async function loadImdbCalendarItems(params = {}) {
  const region = params.region || "US";
  const url = `https://trakt.tv/users/joy98ma0415/lists/want?region=${region}`;

  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache",
      },
    });

    const doc = Widget.dom.parse(response.data);
    const links = Widget.dom.select(doc, 'a[href^="/title/tt"]');

    const imdbIds = Array.from(new Set(
      links.map(el => {
        const href = el.getAttribute?.("href") || Widget.dom.attr(el, "href");
        const match = href.match(/\/title\/(tt\d+)/);
        return match ? match[1] : null;
      }).filter(Boolean)
    ));

    return imdbIds.map(id => ({
      id,
      type: "imdb",
    }));
  } catch (error) {
    console.error("IMDb 上映日历抓取失败:", error);
    throw error;
  }
}
