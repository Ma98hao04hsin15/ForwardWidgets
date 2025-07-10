var WidgetMetadata = {
  id: "tmdb.person",
  title: "TMDB 人物資訊",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  author: "Forward",
  description: "根據 TMDB person ID 抓取人物代表作",
  site: "https://www.themoviedb.org/",
  modules: [
    {
      id: "personKnownFor",
      title: "人物代表作",
      description: "根據 TMDB person ID 顯示人物資訊與代表作",
      params: [
        {
          name: "personId",
          title: "人物 ID",
          type: "input",
          default: "500",
          placeholder: "輸入 TMDB person ID"
        }
      ],
      functionName: "loadPersonKnownFor",
      cacheDuration: 21600,
      requiresWebView: false
    }
  ]
};
async function loadPersonKnownFor(params, ctx) {
  const { personId } = params;
  const url = `https://www.themoviedb.org/person/${personId}?language=zh-CN`;
  const html = await ctx.fetchText(url);

  const name = html.match(/<h2 class="title">([\s\S]*?)<\/h2>/)?.[1]?.trim() || "未知人物";
  const avatar = html.match(/<img class="profile lazyload"[^>]*data-src="([^"]+)"/)?.[1] || "";
  const department = html.match(/<p class="facts">([\s\S]*?)<\/p>/)?.[1]?.trim() || "";

  const knownForSection = html.match(/<section class="known_for[^>]*>([\s\S]*?)<\/section>/)?.[1] || "";
  const items = [...knownForSection.matchAll(/<div class="card">([\s\S]*?)<\/div>/g)].map(match => {
    const block = match[1];
    const idMatch = block.match(/href="\/(movie|tv)\/(\d+)-[^"]+/);
    const type = idMatch?.[1] || "";
    const id = idMatch?.[2] || "";
    const title = block.match(/<p class="title">([\s\S]*?)<\/p>/)?.[1]?.trim() || "";
    const poster = block.match(/data-src="([^"]+)"/)?.[1] || "";
    const subtitle = block.match(/<p class="character">([\s\S]*?)<\/p>/)?.[1]?.trim() || "";

    return {
      title,
      subtitle,
      image: poster,
      url: `https://www.themoviedb.org/${type}/${id}?language=zh-CN`
    };
  });

  return {
    title: `${name} - ${department}`,
    icon: avatar,
    items
  };
}
