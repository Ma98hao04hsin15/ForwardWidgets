var WidgetMetadata = {
  id: "MetacriticCurrentYear",
  title: "Metacritic 本年度电影",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "从 Metacritic 当前年度电影页面提取热门电影，支持分页与排序",
  author: "你的名字",
  site: "https://www.metacritic.com/",
  source: "https://www.metacritic.com/browse/movie/all/all/current-year/",
  modules: [
    {
      title: "本年度电影",
      functionName: "loadCurrentYearMovies",
      cacheDuration: 3600,
      params: [
        {
          name: "page",
          title: "页码（从1开始）",
          default: "1"
        },
        {
          name: "sort",
          title: "排序方式",
          type: "select",
          default: "default",
          options: [
            { title: "默认排序", value: "default" },
            { title: "评分最高", value: "metascore" }
          ]
        }
      ]
    }
  ]
};

async function loadCurrentYearMovies(params) {
  const page = params.page || "1";
  const sort = params.sort === "metascore" ? "?sort=desc" : "";
  const pagePath = parseInt(page) > 1 ? `?page=${page}` : "";
  const url = `https://www.metacritic.com/browse/movie/all/all/current-year/${sort ? sort : pagePath}${sort && pagePath ? "&" + pagePath.slice(1) : ""}`;

  const res = await $http.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const html = res.data;

  const itemRegex = /<div class=".*?product_wrap.*?">(.*?)<\/div>\s*<\/div>\s*<\/div>/gs;
  const items = [...html.matchAll(itemRegex)];

  const result = [];

  for (const item of items) {
    const block = item[1];

    const titleMatch = block.match(/<h3.*?class=".*?product_title.*?">\s*<a.*?>(.*?)<\/a>/s);
    const title = titleMatch?.[1]?.trim() || "未知";

    const linkMatch = block.match(/<a href="(\/movie\/.*?)"/);
    const link = linkMatch ? `https://www.metacritic.com${linkMatch[1]}` : null;

    const imageMatch = block.match(/<img[^>]*src="(.*?)"/);
    const image = imageMatch?.[1] || null;

    const scoreMatch = block.match(/<div class=".*?metascore_w.*?">(.*?)<\/div>/);
    const score = scoreMatch?.[1]?.trim() || "N/A";

    const dateMatch = block.match(/<div class=".*?clamp-details.*?">\s*(.*?)\s*<\/div>/s);
    const date = dateMatch?.[1]?.trim() || "";

    result.push({
      title,
      description: `评分：${score}｜上映日期：${date}`,
      picture: image,
      url: link
    });
  }

  return result;
}
