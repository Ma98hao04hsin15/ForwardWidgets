const WidgetMetadata = {
  id: "imdb.calendar",
  title: "IMDb 上映日历",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 各地區上映日曆，支援本週/本月篩選與 IMDb ID 擷取",
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
            { title: "印度", value: "IN" },
          ],
          description: "例如 US、JP 等",
        },
        {
          name: "period",
          title: "篩選時段",
          type: "enumeration",
          enumOptions: [
            { title: "本週上映", value: "week" },
            { title: "本月上映", value: "month" },
          ],
          description: "回傳本週或整個月的上映作品",
        }
      ]
    }
  ]
};

async function loadImdbCalendarItems(params = {}) {
  const region = params.region || "US";
  const period = params.period || "month";
  const url = `https://www.imdb.com/calendar/?region=${region}`;

  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Cache-Control": "no-cache",
      },
    });

    const doc = Widget.dom.parse(response.data);
    const dateSections = Widget.dom.select(doc, 'h4, ul');

    const results = [];
    let currentDate = "";

    for (const el of dateSections) {
      if (el.tagName === "H4") {
        currentDate = Widget.dom.text(el).trim(); // e.g. "July 5, 2025"
      } else if (el.tagName === "UL") {
        const dateObj = new Date(currentDate);
        if (isNaN(dateObj.getTime())) continue;

        // 過濾邏輯
        const now = new Date();
        const daysDiff = (dateObj - now) / (1000 * 60 * 60 * 24);
        const isWithinWeek = daysDiff >= 0 && daysDiff <= 7;
        const isFuture = daysDiff >= 0;

        const shouldInclude =
          period === "week" ? isWithinWeek : isFuture;

        if (!shouldInclude) continue;

        const items = Widget.dom.select(el, 'li a[href^="/title/tt"]');
        for (const link of items) {
          const href = Widget.dom.attr(link, "href");
          const match = href.match(/\/title\/(tt\d+)/);
          if (match) {
            results.push({
              id: match[1],
              type: "imdb",
              title: Widget.dom.text(link).trim(),
              releaseDate: currentDate,
              link: `https://www.imdb.com/title/${match[1]}/`,
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error("IMDb 上映日历抓取失败:", error);
    throw error;
  }
}
