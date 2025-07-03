const WidgetMetadata = {
  id: "imdb.moviemeter",
  title: "IMDb 熱門電影排行榜",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析 IMDb 熱門電影排行榜，支援依年份篩選，無需 API Key",
  author: "Forward",
  site: "https://www.imdb.com/chart/moviemeter/",
  modules: [
    {
      name: "year",
      type: "input",
      title: "年份",
      default: "",
      placeholder: "例如 2023",
    },
  ],
};

async function loadItems(params, ctx) {
  const yearFilter = params.year?.trim();
  const html = await ctx.request("https://www.imdb.com/chart/moviemeter/");
  const $ = ctx.cheerio.load(html);
  const items = [];

  $("table.chart tbody tr").each((_, el) => {
    const linkEl = $(el).find("td.titleColumn a");
    const title = linkEl.text().trim();
    const href = linkEl.attr("href") || "";
    const idMatch = href.match(/title\/(tt\d+)/);
    const imdbId = idMatch ? idMatch[1] : null;

    const yearText = $(el).find("span.secondaryInfo").text().trim(); // 例如: (2023)
    const year = yearText.replace(/[()]/g, "");

    const image = $(el).find("td.posterColumn img").attr("src") || "";

    if (!imdbId || (yearFilter && year !== yearFilter)) return;

    items.push({
      id: imdbId,
      title: `${title} (${year})`,
      image,
      url: `https://www.imdb.com${href}`,
    });
  });

  return items;
}
