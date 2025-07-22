var WidgetMetadata = {
  id: "CnDramaHotRanking",
  title: "陸劇平台熱播榜",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "抓取愛奇藝、騰訊視頻、優酷、芒果TV 等平台的熱播榜單",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      title: "熱播榜單",
      functionName: "loadHotItems",
      requiresWebView: false,
      cacheDuration: 3600,
      params: [
        {
          name: "platform",
          title: "平台",
          type: "select",
          options: [
            { value: "iqiyi", title: "愛奇藝" },
            { value: "tencent", title: "騰訊視頻" },
            { value: "youku", title: "優酷" },
            { value: "mgtv", title: "芒果TV" }
          ],
          default: "iqiyi"
        }
      ]
    }
  ]
};

async function loadHotItems(params) {
  const platform = params.platform || "iqiyi";

  const urlMap = {
    iqiyi: "https://www.iqiyi.com/ranks/",
    // 其他平台待擴充
  };

  const url = urlMap[platform];
  if (!url) return [];

  const html = await Widget.http.get(url);
  const $ = Widget.dom.parse(html);
  const items = [];

  if (platform === "iqiyi") {
    $(".rank-list-wrapper .rank-list-item").each((i, el) => {
      const title = $(el).find(".title").text().trim();
      const link = $(el).find("a").attr("href");
      let poster = $(el).find("img").attr("src") || "";
      if (poster && poster.startsWith("//")) poster = "https:" + poster;

      if (title && link) {
        items.push({
          id: link,
          title,
          link,
          posterPath: poster,
          mediaType: "tv",
          type: "tv"
        });
      }
    });
  }

  return items;
}
