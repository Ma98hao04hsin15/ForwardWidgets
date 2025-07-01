WidgetMetadata={
  id: "imdb.calendar",
  title: "IMDb 上映日历",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 不同地区未来上映日程，支持日期范围和IMDb ID提取",
  author: "Forward",
  site: "https://www.imdb.com/calendar/",
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
            { title: "印度", value: "IN" }
          ],
          description: "IMDb 地区代码（如 US）"
        },
        {
          name: "start_date",
          title: "起始日期（YYYY-MM-DD）",
          type: "input",
          description: "如 2025-07-01，默认为今天"
        },
        {
          name: "days",
          title: "天数范围",
          type: "input",
          description: "从起始日往后抓取几天，默认 1 天"
        }
      ]
    }
  ]
};

async function loadImdbCalendarItems(params = {}) {
  const region = params.region || "US";
  const startDateStr = params.start_date || new Date().toISOString().split('T')[0];
  const days = parseInt(params.days || "1");

  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) throw new Error("起始日期格式错误，必须为 YYYY-MM-DD");

  const imdbData = [];

  for (let i = 0; i < days; i++) {
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + i);
    const formattedDate = targetDate.toISOString().split('T')[0];
    const url = `https://www.imdb.com/calendar/?region=${region}&date=${formattedDate}`;

    try {
      const response = await Widget.http.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
        }
      });

      const doc = Widget.dom.parse(response.data);
      const listItems = Widget.dom.select(doc, "ul.ipc-metadata-list > li");

      const items = listItems.map(li => {
        const link = Widget.dom.select(li, 'a[href^="/title/tt"]')[0];
        if (!link) return null;

        const title = Widget.dom.text(link)?.trim();
        const href = link.getAttribute?.("href") || Widget.dom.attr(link, "href");
        const match = href.match(/\/title\/(tt\d+)/);
        const imdbId = match ? match[1] : null;

        return imdbId ? {
          id: imdbId,
          type: "imdb",
          title,
          date: formattedDate
        } : null;
      }).filter(Boolean);

      if (items.length > 0) {
        imdbData.push(...items);
      }
    } catch (err) {
      console.error(`解析 ${url} 时失败:`, err);
    }
  }

  return imdbData;
}
