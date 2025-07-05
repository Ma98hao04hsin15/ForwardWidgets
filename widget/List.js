const WidgetMetadata = {
  id: "douban",
  title: "豆瓣",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析豆瓣片单与 IMDb 列表，获取视频信息",
  author: "Joy",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets",
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
              title: "电影学院本科生必看100部",
              value: "https://www.douban.com/doulist/108673"
            },
            {
              title: "北京电影学院硕士要看的100部电影",
              value: "https://www.douban.com/doulist/42564"
            }
          ]
        }
      ]
    },
    {
      title: "IMDb 列表",
      functionName: "loadImdbItems",
      params: [
        {
          name: "url",
          title: "IMDb 列表地址",
          type: "input",
          placeholders: [
            {
              title: "IMDb 热门电视剧",
              value: "https://www.imdb.com/chart/tvmeter/"
            },
            {
              title: "用户自建列表",
              value: "https://www.imdb.com/list/ls055592025/"
            }
          ]
        }
      ]
    }
  ]
};

// 加载 IMDb 列表
async function loadImdbItems(params = {}) {
  const url = params.url;
  if (!url || !url.includes("imdb.com")) {
    throw new Error("无效的 IMDb 链接");
  }

  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36"
    }
  });

  if (!response?.data) throw new Error("获取 IMDb 页面失败");

  const docId = Widget.dom.parse(response.data);
  if (docId < 0) throw new Error("IMDb 页面解析失败");

  const linkElements = Widget.dom.select(docId, 'a[href*="/title/tt"]');
  const imdbSet = new Set();

  for (const el of linkElements) {
    const href = await Widget.dom.attr(el, "href");
    const match = href.match(/\/title\/(tt\d{7,8})/);
    if (match) imdbSet.add(match[1]);
  }

  return Array.from(imdbSet).map((id) => ({ id, type: "imdb" }));
}

// 加载豆瓣片单
async function loadCardItems(params = {}) {
  const url = params.url;
  if (!url) throw new Error("缺少片单 URL");

  if (url.includes("douban.com/doulist/")) {
    return await loadDefaultList(params);
  } else if (url.includes("douban.com/subject_collection/")) {
    return await loadSubjectCollection(params);
  }

  throw new Error("不支持的豆瓣链接类型");
}

// 加载豆瓣默认片单（如 doulist/12345）
async function loadDefaultList(params = {}) {
  const listId = params.url.match(/doulist\/(\d+)/)?.[1];
  if (!listId) throw new Error("无法获取片单 ID");

  const pageUrl = `https://www.douban.com/doulist/${listId}/`;

  const response = await Widget.http.get(pageUrl, {
    headers: {
      Referer: `https://movie.douban.com/explore`,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36"
    }
  });

  const docId = Widget.dom.parse(response.data);
  if (docId < 0) throw new Error("解析 HTML 失败");

  const videoElementIds = Widget.dom.select(docId, ".doulist-item .title a");

  const doubanIds = [];
  for (const itemId of videoElementIds) {
    const link = await Widget.dom.attr(itemId, "href");
    const id = link.match(/subject\/(\d+)/)?.[1];
    if (id) doubanIds.push({ id, type: "douban" });
  }

  return doubanIds;
}

// 加载豆瓣合集（如 subject_collection/xxx）
async function loadSubjectCollection(params = {}) {
  const listId = params.url.match(/subject_collection\/(\w+)/)?.[1];
  if (!listId) throw new Error("无法获取合集 ID");

  const pageUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${listId}/items?start=0&count=1000&items_only=1&for_mobile=1`;

  return await loadItemsFromApi({ url: pageUrl });
}

// 加载豆瓣 API 返回的片单内容
async function loadItemsFromApi(params = {}) {
  const url = params.url;
  const response = await Widget.http.get(url, {
    headers: {
      Referer: url,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36"
    }
  });

  if (response.data?.subject_collection_items) {
    return response.data.subject_collection_items.map((item) => ({
      id: item.id,
      type: "douban"
    }));
  }

  return [];
}
