WidgetMetadata = {
  id: "forward.tmdb",
  title: "TMDB播放平台",
  version: "1.0.4",
  requiredVersion: "0.0.1",
  description: "获取 TMDB 的榜单数据",
  author: "Joy",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets",
  modules: [
  {
  id: "networks",
  title: "播出平台",
  functionName: "networks",
  params: [
    {
      name: "with_networks",
      title: "播出平台",
      type: "enumeration",
      multiple: true,
      enumOptions: [
        // 🌐 国际流媒体平台
        { title: "Netflix", value: "213" },
        { title: "Disney+", value: "2739" },
        { title: "Apple TV+", value: "2552" },
        { title: "HBO Max", value: "3186" },
        { title: "Hulu", value: "453" },
        { title: "Amazon Prime Video", value: "1024" },
        { title: "Paramount+", value: "2076" },
        { title: "Peacock", value: "3353" },

        // 🇺🇸 美国电视台/平台
        { title: "NBC", value: "6" },
        { title: "CBS", value: "16" },
        { title: "ABC", value: "2" },
        { title: "FOX", value: "19" },
        { title: "The CW", value: "71" },
        { title: "AMC", value: "174" },
        { title: "FX", value: "88" },
        { title: "Showtime", value: "67" },

        // 🇯🇵 日本电视台/平台
        { title: "NHK", value: "2629" },
        { title: "TBS", value: "297" },
        { title: "TV Tokyo", value: "310" },
        { title: "Fuji TV", value: "307" },
        { title: "Nippon TV", value: "308" },
        { title: "WOWOW", value: "334" },

        // 🇰🇷 韩国电视台/平台
        { title: "tvN", value: "4521" },
        { title: "JTBC", value: "4341" },
        { title: "KBS2", value: "3562" },
        { title: "MBC", value: "3563" },
        { title: "SBS", value: "3564" },
        { title: "ENA", value: "1795" },
        { title: "TVING", value: "5024" },
        { title: "Coupang Play", value: "5912" },
        { title: "Wavve", value: "4503" }
      ],
    },
    {
    name: "first_air_date.gte",
    title: "起始年份",
    type: "number",
    placeholder: "如 2020"
    },
    {
    name: "first_air_date.lte",
    title: "结束年份",
    type: "number",
    placeholder: "如 2024"
    },
    {
    name: "page",
    title: "页码",
    type: "page"
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
    }
  ],
};

async function fetchData(api, params, forceMediaType) {
  try {
    const response = await Widget.tmdb.get(api, { params: params });

    if (!response) {
      throw new Error("获取数据失败");
    }

    console.log(response);
    const data = response.results;
    const result = data.map((item) => {
      let mediaType = item.media_type;
      if (forceMediaType) {
        mediaType = forceMediaType;
      } else if (mediaType == null) {
        if (item.title) {
          mediaType = "movie";
        } else {
          mediaType = "tv";
        }
      }
      return {
        id: item.id,
        type: "tmdb",
        title: item.title ?? item.name,
        description: item.overview,
        releaseDate: item.release_date ?? item.first_air_date,
        backdropPath: item.backdrop_path,
        posterPath: item.poster_path,
        rating: item.vote_average,
        mediaType: mediaType,
      };
    });
    return result;
  } catch (error) {
    console.error("调用 TMDB API 失败:", error);
    throw error;
  }
}

async function networks(params) {
  let api = `discover/tv`;
  delete params.type;
  return await fetchData(api, params);
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

