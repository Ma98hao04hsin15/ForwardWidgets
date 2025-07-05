// 豆瓣片单组件
WidgetMetadata = {
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
        },
      ],
    },
  ],
},
  ],
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析IMDb片单，获取视频信息",
  author: "Joy",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets"
};async function loadImdbItems(params = {}) {
  const url = params.url;
  if (!url || !url.includes("imdb.com")) {
    throw new Error("无效的 IMDb 链接");
  }

  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36"
    }
  });

  if (!response || !response.data) {
    throw new Error("获取 IMDb 页面失败");
  }

  const docId = Widget.dom.parse(response.data);
  if (docId < 0) {
    throw new Error("IMDb 页面解析失败");
  }

  const linkElements = Widget.dom.select(docId, 'a[href*="/title/tt"]');
  const imdbSet = new Set();

  for (const el of linkElements) {
    const href = await Widget.dom.attr(el, "href");
    const match = href.match(/\/title\/(tt\d{7,8})/);
    if (match) {
      imdbSet.add(match[1]);
    }
  }

  const imdbIds = Array.from(imdbSet).map((id) => ({
    id,
    type: "imdb"
  }));

  console.log("IMDb ID 数量:", imdbIds.length);
  return imdbIds;
}


async function loadItemsFromApi(params = {}) {
  const url = params.url;
  console.log("请求 API 页面:", url);
  const listId = params.url.match(/subject_collection\/(\w+)/)?.[1];
  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://m.douban.com/subject_collection/${listId}/`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  console.log("请求结果:", response.data);
  if (response.data && response.data.subject_collection_items) {
    const items = response.data.subject_collection_items;
    const doubanIds = items.map((item) => ({
      id: item.id,
      type: "douban",
    }));
    return doubanIds;
  }
  return [];
}

async function loadSubjectCollection(params = {}) {
  const listId = params.url.match(/subject_collection\/(\w+)/)?.[1];
  console.debug("合集 ID:", listId);
  if (!listId) {
    console.error("无法获取合集 ID");
    throw new Error("无法获取合集 ID");
  }

  const start = params.start || 0;
  const limit = params.limit || 20;
  let pageUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${listId}/items?start=${start}&count=${limit}&updated_at&items_only=1&type_tag&for_mobile=1`;
  if (params.type) {
    pageUrl += `&type=${params.type}`;
  }
  params.url = pageUrl;
  return await loadItemsFromApi(params);
}

async function loadRecommendMovies(params = {}) {
  return await loadRecommendItems(params, "movie");
}

async function loadRecommendShows(params = {}) {
  return await loadRecommendItems(params, "tv");
}

async function loadRecommendItems(params = {}, type = "movie") {
  const start = params.start || 0;
  const limit = params.limit || 20;
  const category = params.category || "";
  const categoryType = params.type || "";
  let url = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${type}?start=${start}&limit=${limit}&category=${category}&type=${categoryType}`;
  if (category == "all") {
    url = `https://m.douban.com/rexxar/api/v2/${type}/recommend?refresh=0&start=${start}&count=${limit}&selected_categories=%7B%7D&uncollect=false&score_range=0,10&tags=`;
  }
  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://movie.douban.com/${type}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  console.log("请求结果:", response.data);
  if (response.data && response.data.items) {
    const items = response.data.items;
    const doubanIds = items.filter((item) => item.id != null).map((item) => ({
      id: item.id,
      type: "douban",
    }));
    return doubanIds;
  }
  return [];
}
