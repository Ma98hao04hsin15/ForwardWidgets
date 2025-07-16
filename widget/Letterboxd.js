var WidgetMetadata = {
  id: "letterboxd_list",
  title: "Letterboxd 列表抓取",
  description: "根据用户输入的 Letterboxd 列表 URL，抓取影片封面、标题和链接",
  author: "YourName",
  site: "https://letterboxd.com",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 3600,
  modules: [
    {
      title: "获取列表影片",
      functionName: "getLetterboxdList",
      cacheDuration: 1800,
      inputs: [
        {
          key: "url",
          type: "input",
          title: "Letterboxd 列表 URL",
          placeholder: "https://letterboxd.com/username/list/list-name/",
          required: true
        },
        {
          key: "page",
          type: "offset",
          title: "页码",
          placeholder: "默认为 1",
          required: false
        }
      ]
    }
  ]
};

async function getLetterboxdList(params) {
  const listUrl = params.url;
  const page = params.page && params.page > 1 ? params.page : 1;
  const fetchUrl = listUrl + (page > 1 ? `page/${page}/` : "");

  // 发起请求
  const response = await Widget.http.get(fetchUrl, {
    headers: {
      "User-Agent": "ForwardWidgets",
      "Referer": "https://letterboxd.com"
    }
  });

  // 解析 HTML
  const $ = Widget.html.load(response.data);

  // 遍历影片项
  const items = [];
  $(".poster-list > li").each((index, element) => {
    const $el = $(element);
    const linkPath = $el.find("a").attr("href"); // e.g. /film/inception/
    const title = $el.find("img").attr("alt");
    const coverUrl = $el.find("img").attr("data-src") || $el.find("img").attr("src");
    const id = linkPath.replace(/\/film\/|\/$/g, ""); // 影片 slug 作为 ID

    items.push({
      id: id,
      type: "url",
      title: title,
      coverUrl: coverUrl,
      releaseDate: "",
      mediaType: "movie",
      rating: "",
      description: "",
      url: "https://letterboxd.com" + linkPath
    });
  });

  return items;
}
