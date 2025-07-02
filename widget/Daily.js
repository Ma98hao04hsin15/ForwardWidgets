WidgetMetadata = {
  id: "forward.tmdb",
  title: "TMDB",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "获取 TMDB 的榜单数据",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
        {
          name: "with_origin_country",
          title: "国家",
          type: "input",
          belongTo: {
            paramName: "with_genres",
            value: ["10764"],
          },
          value: "CN",
          placeholders: [
            {
              title: "中国",
              value: "CN",
            },
            {
              title: "美国",
              value: "US",
            },
            {
              title: "台灣",
              value: "TW",
            },
            {
              title: "日本",
              value: "JP",
            },
            {
              title: "韩国",
              value: "KR",
            },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page"
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
      id: "networks",
      title: "播出平台",
      functionName: "networks",
      params: [
        {
          name: "with_networks",
          title: "播出平台",
          type: "enumeration",
          enumOptions: [
            {
              title: "Netflix",
              value: "213",
            },
            {
              title: "Disney+",
              value: "2739",
            },
            {
              title: "Apple TV+",
              value: "2552",
            },
            {
              title: "HBO Max",
              value: "3186",
            },
            {
              title: "Hulu",
              value: "453",
            },
            {
              title: "HBO",
              value: "49",
            },
            {
              title: "Prime Video",
              value: "1024", 
            },
            {
              title: "Paramount+",
              value: "4330", 
            },
            {
              title: "Peacock",
              value: "3353", 
            },
            {
              title: "NHK",
              value: "236", 
            },
            {
              title: "TBS",
              value: "317", 
            },
            {
              title: "Fuji TV",
              value: "2368", 
            },
            {
              title: "NTV",
              value: "195", 
            },
            {
              title: "TV Asahi",
              value: "231", 
            },
            {
              title: "TV Tokyo",
              value: "269", 
            },
            {
              title: "WOWOW",
              value: "273", 
            },
            {
              title: "AbemaTV",
              value: "2449", 
            },
            {
              title: "U-NEXT",
              value: "2405", 
            },
            {
              title: "tvN",
              value: "866", 
            },
            {
              title: "KBS1",
              value: "830", 
            },
            {
              title: "KBS2",
              value: "1113", 
            },
            {
              title: "MBC",
              value: "38", 
            },
            {
              title: "SBS",
              value: "36", 
            },
            {
              title: "JTBC",
              value: "97", 
            },
            {
              title: "ENA",
              value: "1928", 
            },
            {
              title: "Channel A",
              value: "2274", 
            },
            {
              title: "OCN",
              value: "1409", 
            },
            {
              title: "PTS",
              value: "837", 
            },
            {
              title: "BS朝日",
              value: "", 
            },
            {
              title: "iQIYI",
              value: "1330", 
            },
            {
              title: "Tencent Video",
              value: "2007", 
            },
            {
              title: "Mango TV",
              value: "1631", 
            },
            {
              title: "Youk",
              value: "1419", 
            },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page"
        },
        {
          name: "language",
          title: "语言",
          type: "language",
          value: "zh-CN",
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
    if (platform_filter) {
      const matches = networks.some((n) =>
        n.toLowerCase().includes(platform_filter.toLowerCase())
      );
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
  let url = params.url;

  // append ?view=grid
  if (!url.includes("view=grid")) {
    if (url.includes("?")) {
      url = url + "&view=grid";
    } else {
      url = url + "?view=grid";
    }
  }

  console.log("请求片单页面:", url);
  // 发送请求获取片单页面
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


  console.log("片单页面数据长度:", response.data.length);
  console.log("开始解析");

  // 解析 HTML 得到文档 ID
  const $ = Widget.html.load(response.data);
  if (!$ || $ === null) {
    throw new Error("解析 HTML 失败");
  }

  //        // 获取所有视频项，得到元素ID数组
  const coverElements = $(".block.aspect-poster");

  console.log("items:", coverElements);

  let tmdbIds = [];
  for (const itemId of coverElements) {
    const $item = $(itemId);
    const link = $item.attr("href");
    if (!link) {
      continue;
    }
    const match = link.match(/^\/(movie|tv)\/([^\/-]+)-/)
    const type = match?.[1];
    const id = match?.[2];
    if (id && type) {
      tmdbIds.push({ id: `${type}.${id}`, type: 'tmdb' });
    }
  }

  return tmdbIds;
}
