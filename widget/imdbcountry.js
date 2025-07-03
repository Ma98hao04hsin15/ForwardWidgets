const WidgetMetadata = {
  id: "forward.imdb.regionlist",
  title: "IMDb 地区榜单",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "根据地区和类型从 IMDb 获取榜单数据",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "list",
      title: "地区片单",
      functionName: "list",
      params: [
        {
          name: "region",
          title: "国家/地区代码",
          type: "input",
          description: "例如 us（美国）、kr（韩国）、jp（日本）",
          default: "us",
        },
        {
          name: "title_type",
          title: "作品类型",
          type: "select",
          options: [
            { title: "电视剧", value: "tv_series" },
            { title: "电影", value: "feature" },
            { title: "迷你剧", value: "tv_miniseries" },
            { title: "纪录片", value: "documentary" },
          ],
          default: "tv_series",
        },
      ],
    },
  ],
};
async function list(params = {}) {
  const region = params.region || "us";
  const titleType = params.title_type || "tv_series";

  const url = `https://www.imdb.com/search/title/?title_type=${titleType}&countries=${region}&sort=moviemeter,asc`;
  console.log("请求 IMDb 高级搜索页面:", url);

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
  const items = [];

  $(".lister-item").each((_, element) => {
    const link = $(element).find("h3.lister-item-header a").attr("href"); // /title/ttXXXXXX/
    const title = $(element).find("h3.lister-item-header a").text().trim();
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
