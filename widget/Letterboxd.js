var WidgetMetadata = {
  id: "letterboxd.list",
  title: "Letterboxd 片單",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析 Letterboxd 公開片單內容",
  author: "Forward",
  site: "https://letterboxd.com",
  cacheDuration: 86400,
  modules: [
    {
      id: "list",
      title: "Letterboxd 片單",
      type: "list",
      requiresWebView: false,
      functionName: "loadLetterboxdList",
      params: [
        {
          name: "url",
          title: "Letterboxd 片單網址",
          type: "string",
          default: "https://letterboxd.com/evanhsin/list/my-favorite-korean-films/"
        }
      ]
    }
  ]
};

async function loadLetterboxdList(params, ctx) {
  const url = params.url;
  const html = await ctx.network.fetchHtml(url);

  const items = [];
  const movieBlocks = html.match(/<li class="poster-container.*?<\/li>/gs) || [];

  for (const block of movieBlocks) {
    const titleMatch = block.match(/data-film-slug="\/film\/([^"]+)"/);
    const posterMatch = block.match(/data-src="([^"]+)"|src="([^"]+)"/);
    const yearMatch = block.match(/data-film-release-year="(\d{4})"/);
    const filmSlug = titleMatch?.[1];
    const posterUrl = posterMatch?.[1] || posterMatch?.[2];
    const year = yearMatch?.[1];

    if (filmSlug) {
      const title = decodeURIComponent(filmSlug.replace(/-/g, " "));
      items.push({
        title: title.replace(/\b\w/g, c => c.toUpperCase()),
        subtitle: year || "",
        image: posterUrl?.replace(/(?<=cloudfront\.net\/)([^.]+)\.jpg.*/, '$1-0-230-345-crop.jpg'),
        url: `https://letterboxd.com/film/${filmSlug}/`
      });
    }
  }

  return { items };
}
