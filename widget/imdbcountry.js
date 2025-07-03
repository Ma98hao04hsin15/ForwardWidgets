WidgetMetadata = {
  id: "forward.imdb",
  title: "TMDB",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "获取 IMDb 的榜单数据",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "list",
      title: "片单",
      functionName: "list",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "input",
          description: "IMDb 片单地址",
          placeholders: [
            {
              title: "Most popular TV shows",
              value: "https://www.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv",
            }
          ],
        }
      ],
    }
  ],
};

async function list(params = {}) {
  let url = params.url;
  console.log("请求 IMDb 片单页面:", url);

  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://www.imdb.com/`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response || !response.data) {
    throw new Error("获取 IMDb 页面失败");
  }

  const $ = Widget.html.load(response.data);
  if (!$) {
    throw new Error("解析 IMDb HTML 失败");
  }

  const items = [];
  $("table.chart tbody tr").each((_, element) => {
    const link = $(element).find("td.titleColumn a").attr("href"); // e.g. "/title/tt0944947/"
    const title = $(element).find("td.titleColumn a").text().trim();
    const imdbIdMatch = link?.match(/\/title\/(tt\d+)\//);
    const imdbId = imdbIdMatch?.[1];
    if (imdbId) {
      items.push({
        id: imdbId,
        type: "imdb",
        title,
      });
    }
  });

  return items;
}
