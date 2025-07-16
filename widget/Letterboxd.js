var WidgetMetadata = {
  id: "letterboxd_list_fetcher",
  title: "Letterboxd 清單抓取器",
  author: "你的名字",
  version: "1.0.0",
  description: "抓取 Letterboxd 公開清單中的電影項目",
  modules: [
    {
      title: "抓取 Letterboxd 清單",
      functionName: "fetchLetterboxdList",
      params: [
        {
          name: "url",
          type: "input",
          label: "清單 URL",
          placeholder: "例如：https://letterboxd.com/username/list/list-name/"
        }
      ]
    }
  ]
};

async function fetchLetterboxdList(params) {
  const url = params.url?.trim();
  if (!url || !url.includes("letterboxd.com")) {
    throw "請輸入合法的 Letterboxd 清單網址";
  }

  try {
    const html = await Widget.http.get(url);
    const dom = Widget.dom.parse(html);

    const posters = dom.select(".poster-container");
    if (!posters.length) {
      throw "未找到任何電影項目，請確認網址是否為公開清單";
    }

    const items = posters.map(poster => {
      const link = poster.select("a").attr("href");
      const title = poster.select("img").attr("alt")?.trim();
      const coverUrl = poster.select("img").attr("data-src") || poster.select("img").attr("src");

      const id = link?.split("/").filter(Boolean).pop(); // 最後一段作為 ID

      return {
        id: id || link,
        type: "url",
        title: title || "未命名",
        coverUrl: coverUrl?.startsWith("https://") ? coverUrl : `https://letterboxd.com${coverUrl}`
      };
    });

    return items;
  } catch (err) {
    throw `抓取失敗：${err}`;
  }
}
