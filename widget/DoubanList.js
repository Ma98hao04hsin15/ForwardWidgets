// 豆瓣片单组件
WidgetMetadata = {
  id: "douban",
  title: "豆瓣",
  modules: [
    {
      title: "片单",
      requiresWebView: false,
      functionName: "loadCardItems",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "input",
          description: "豆瓣片单地址",
          placeholders: [
            {
              title: "北京电影学院硕士要看的100部电影",
              value: "https://www.douban.com/doulist/42564/",
            },
            {
              title: "电影学院本科生必看100部",
              value:
                "https://www.douban.com/doulist/108673/",
            },
            {
              title: "第97届奥斯卡",
              value:
                "https://m.douban.com/subject_collection/EC7I7ZDRA?type=rank",
            },
          ],
        },
        {
          name: "start",
          title: "开始",
          type: "count",
        },
        {
          name: "limit",
          title: "每页数量",
          type: "constant",
          value: "0",
        },
      ],
    },
  ],
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析豆瓣片单，获取视频信息",
  author: "Joy",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets"
};
// 解析豆瓣片单
async function loadCardItems(params = {}) {
  try {
    console.log("开始解析豆瓣片单...");
    console.log("参数:", params);
    // 获取片单 URL
    const url = params.url;
    if (!url) {
      console.error("缺少片单 URL");
      throw new Error("缺少片单 URL");
    }
    // 验证 URL 格式
    if (url.includes("douban.com/doulist/")) {
      return loadDefaultList(params);
    } else if (url.includes("douban.com/subject_collection/")) {
      return loadSubjectCollection(params);
    }
  } catch (error) {
    console.error("解析豆瓣片单失败:", error);
    throw error;
  }
}

async function loadDefaultList(params = {}) {
  const url = params.url;
  // 提取片单 ID
  const listId = url.match(/doulist\/(\d+)/)?.[1];
  console.debug("片单 ID:", listId);
  if (!listId) {
    console.error("无法获取片单 ID");
    throw new Error("无法获取片单 ID");
  }

  const start = params.start || 0;
  const limit = params.limit || 0;
  //        // 构建片单页面 URL
  const pageUrl = `https://www.douban.com/doulist/${listId}/?start=${start}&limit=${limit}`;

  console.log("请求片单页面:", pageUrl);
  // 发送请求获取片单页面
  const response = await Widget.http.get(pageUrl, {
    headers: {
      Referer: `https://movie.douban.com/explore`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response || !response.data) {
    throw new Error("获取片单数据失败");
  }

  console.log("片单页面数据长度:", response.data.length);
  console.log("开始解析");

  // 解析 HTML 得到文档 ID
  const docId = Widget.dom.parse(response.data);
  if (docId < 0) {
    throw new Error("解析 HTML 失败");
  }
  console.log("解析成功:", docId);

  //        // 获取所有视频项，得到元素ID数组
  const videoElementIds = Widget.dom.select(docId, ".doulist-item .title a");

  console.log("items:", videoElementIds);

  let doubanIds = [];
  for (const itemId of videoElementIds) {
    const link = await Widget.dom.attr(itemId, "href");
    const id = link.match(/subject\/(\d+)/)?.[1];
    if (id) {
      doubanIds.push({ id: id, type: "douban" });
    }
  }

  return doubanIds;
}
