WidgetMetadata = {
  id: "forward.imdb",
  title: "IMDB 片单",
  description: "抓取 IMDb 当前最受欢迎的电视剧/电影榜单",
  author: "pack1r",
  site: "https://github.com/pack1r/ForwardWidgets",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "IMDB 片单",
      description: "IMDB 片单",
      requiresWebView: false,
      functionName: "loadCardItems",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "input",
          description: "IMDB 片单地址",
          placeholders: [
            {
              title: "Most popular TV shows",
              value: "https://www.imdb.com/chart/tvmeter/?ref_=chtmvm_nv_menu",
            },
            {
              title: "IMDb Most popular movies",
              value: "https://www.imdb.com/chart/moviemeter/?ref_=chttvm_nv_menu",
            },
          ],
        },
      ],
    },
  ],
};

async function loadCardItems(params = {}) {
  const url = params.url;
  if (!url) {
    console.error("缺少片单 URL");
    throw new Error("缺少片单 URL");
  }

  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  if (!response || !response.data) {
    throw new Error("获取片单数据失败");
  }

  console.log(response.data);
  const videoIds = [];

  //load application/ld+json content
  const ldJson = response.data.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/
  )
  if (ldJson && ldJson[1]) {
    const json = JSON.parse(ldJson[1]);
    console.log(json);
    for (const item of json.itemListElement) {
      //regex ttxxxx id
      const match = item.item.url.match(/tt(\d+)/);
      if (match && match[1]) {
        videoIds.push({
          id: `tt${match[1]}`,
          type: "imdb",
          title: item.name,
          description: item.description,
          coverUrl: item.image,
        });
      }
    }
  } else {
    const docId = Widget.dom.parse(response.data);
    if (docId < 0) {
      throw new Error("解析 HTML 失败");
    }
    const videoElementIds = Widget.dom.select(docId, ".ipc-metadata-list-summary-item .ipc-poster a");
    for (const itemId of videoElementIds) {
      const link = await Widget.dom.attr(itemId, "href");
      const id = link.match(/tt(\d+)/);
      if (id && id[1]) {
        videoIds.push({ id: `tt${id[1]}`, type: "imdb" });
      }
    }
  }

  console.log(videoIds);
  return videoIds;
}
