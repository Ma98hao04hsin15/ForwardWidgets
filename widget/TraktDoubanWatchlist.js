const WidgetMetadata = {
  id: "douban",
  title: "豆瓣我看&豆瓣个性化推荐",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "抓取豆瓣用户的想看、在看、看过清单，支持随机抽取想看内容",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      title: "豆瓣我看",
      requiresWebView: false,
      functionName: "loadInterestItems",
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "用户ID",
          type: "input",
          description: "未填写情况下接口不可用",
        },
        {
          name: "status",
          title: "状态",
          type: "enumeration",
          enumOptions: [
            {
              title: "想看",
              value: "mark",
            },
            {
              title: "在看",
              value: "doing",
            },
            {
              title: "看过",
              value: "done",
            },
            {
              title: "随机想看(从想看列表中无序抽取9个影片)",
              value: "random_mark",
            },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        },
      ],
    }
  ]
};

async function loadInterestItems(params = {}) {
  const userId = params.user_id;
  let status = params.status || "mark";
  const page = params.page || 1;

  if (!userId) {
    throw new Error("必须提供豆瓣用户ID");
  }

  const statusMap = {
    mark: "wish",
    doing: "do",
    done: "collect",
    random_mark: "wish"
  };

  const path = statusMap[status];
  const start = (page - 1) * 20;
  const url = `https://www.douban.com/people/${userId}/${path}?start=${start}`;

  const response = await Widget.http.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  const doc = Widget.dom.parse(response.data);
  const items = Widget.dom.select(doc, "div.item");

  let results = [];

  for (const item of items) {
    const linkEl = Widget.dom.select(item, "div.info a")[0];
    const title = Widget.dom.text(linkEl);
    const href = Widget.dom.attr(linkEl, "href");

    // 優先使用 IMDb ID，如果有的話
    const imdbMatch = href.match(/imdb\.com\/title\/(tt\d+)/);
    if (imdbMatch) {
      results.push({
        id: imdbMatch[1],
        type: "imdb",
        title,
      });
    } else if (href.includes("movie.douban.com/subject/")) {
      // 否則用豆瓣 ID
      const doubanMatch = href.match(/subject\/(\d+)/);
      if (doubanMatch) {
        results.push({
          id: doubanMatch[1],
          type: "douban",
          title,
        });
      }
    }
  }

  // 隨機模式只返回 9 部作品
  if (status === "random_mark") {
    results = results.sort(() => 0.5 - Math.random()).slice(0, 9);
  }

  return results;
}
