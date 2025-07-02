WidgetMetadata = {
  id: "forward.tmdb",
  title: "TMDB",
  version: "1.0.2",
  requiredVersion: "0.0.1",
  description: "获取 TMDB 的榜单数据，支持播出平台筛选及每日播出列表",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "with_origin_country",
      title: "国家",
      type: "input",
      belongTo: {
        paramName: "with_genres",
        value: ["10764"],
      },
      value: "CN",
      placeholders: [
        { title: "中国", value: "CN" },
        { title: "美国", value: "US" },
        { title: "台灣", value: "TW" },
        { title: "日本", value: "JP" },
        { title: "韩国", value: "KR" },
      ],
    },
    {
      id: "networks",
      title: "播出平台",
      functionName: "networks",
      params: [
        {
          name: "with_networks",
          title: "播出平台",
          type: "enumeration",
          enumOptions: [
            { title: "Netflix", value: "213" },
            { title: "Disney+", value: "2739" },
            { title: "Apple TV+", value: "2552" },
            { title: "HBO Max", value: "3186" },
            { title: "Hulu", value: "453" },
            { title: "HBO", value: "49" },
            { title: "Prime Video", value: "1024" },
            { title: "Paramount+", value: "4330" },
            { title: "Peacock", value: "3353" },
            { title: "NHK", value: "236" },
            { title: "TBS", value: "317" },
            { title: "Fuji TV", value: "2368" },
            { title: "NTV", value: "195" },
            { title: "TV Asahi", value: "231" },
            { title: "TV Tokyo", value: "269" },
            { title: "WOWOW", value: "273" },
            { title: "AbemaTV", value: "2449" },
            { title: "U-NEXT", value: "2405" },
            { title: "tvN", value: "866" },
            { title: "KBS1", value: "830" },
            { title: "KBS2", value: "1113" },
            { title: "MBC", value: "38" },
            { title: "SBS", value: "36" },
            { title: "JTBC", value: "97" },
            { title: "ENA", value: "1928" },
            { title: "Channel A", value: "2274" },
            { title: "OCN", value: "1409" },
            { title: "PTS", value: "837" },
            { title: "iQIYI", value: "1330" },
            { title: "Tencent Video", value: "2007" },
            { title: "Mango TV", value: "1631" },
            { title: "Youk", value: "1419" },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
        {
          name: "language",
          title: "语言",
          type: "language",
          value: "zh-CN",
        },
      ],
    },
    {
      id: "daily_airing",
      title: "一週播出清單（平台可篩選）",
      functionName: "loadTodayAiringWithPlatform",
      params: [
        {
          name: "region",
          title: "地區",
          type: "enumeration",
          value: "TW",
          enumOptions: [
            { title: "台灣", value: "TW" },
            { title: "日本", value: "JP" },
            { title: "韓國", value: "KR" },
            { title: "中國", value: "CN" },
            { title: "美國", value: "US" },
          ],
        },
        {
          name: "platform_filter",
          title: "平台篩選（關鍵字）",
          type: "input",
          value: "",
          placeholder: "如：tvN / Netflix",
        },
      ],
    },
  ],
};

async function loadTodayAiringWithPlatform({ region = "TW", platform_filter = "" }) {
  const url = `https://www.themoviedb.org/tv/on-the-air?region=${region}`;
  const html = await (await fetch(url)).text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [];
  const cards = [...doc.querySelectorAll(".card.style_1")];

  const keyword = platform_filter.trim().toLowerCase();

  for (const card of cards) {
    const title = card.querySelector(".title a")?.textContent?.trim();
    const href = card.querySelector(".title a")?.getAttribute("href");
    const id = href?.split("/")[2];
    const poster = card.querySelector(".image_content img")?.getAttribute("data-src") || "";
    const airDateText = card.querySelector(".air_date")?.textContent?.trim() || "";
    const networks = [...card.querySelectorAll(".network")]
      .map((el) => el.getAttribute("title"))
      .filter(Boolean);

    // 平台篩選（模糊比對）
    if (keyword) {
      const matches = networks.some((n) => n.toLowerCase().includes(keyword));
      if (!matches) continue;
    }

    items.push({
      title,
      subtitle: `${airDateText}｜${networks.join(", ")}`,
      picture: poster,
      link: `https://www.themoviedb.org${href}`,
      id,
    });
  }

  return items;
}

async function list(params = {}) {
  let url = params.url || "";

  if (!url.includes("view=grid")) {
    if (url.includes("?")) {
      url += "&view=grid";
    } else {
      url += "?view=grid";
    }
  }

  console.log("请求片单页面:", url);

  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://www.themoviedb.org/`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response || !response.data) {
    throw new Error("获取片单数据失败");
  }

  const $ = Widget.html.load(response.data);
  if (!$) {
    throw new Error("解析 HTML 失败");
  }

  const coverElements = $(".block.aspect-poster");

  const tmdbIds = [];

  coverElements.each((_, el) => {
    const $item = $(el);
    const link = $item.attr("href");
    if (!link) return;
    const match = link.match(/^\/(movie|tv)\/([^\/-]+)-/);
    const type = match?.[1];
    const id = match?.[2];
    if (id && type) {
      tmdbIds.push({ id: `${type}.${id}`, type: "tmdb" });
    }
  });

  return tmdbIds;
}
