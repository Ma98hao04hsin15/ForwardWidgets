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
              title: "Amazon Prime Video",
              value: "1024",
            },
            {
              title: "Peacock",
              value: "3353",
            },
            {
              title: "Paramount+",
              value: "4330",
            },
            {
              title: "AMC",
              value: "174",
            },
            {
              title: "CBS",
              value: "16",
            },
            {
              title: "NBC",
              value: "6",
            },
            {
              title: "ABC",
              value: "2",
            },
            {
              title: "NHK",
              value: "2334",
            },
            {
              title: "TBS",
              value: "160",
            },
            {
              title: "NTV",
              value: "57",
            },
            {
              title: "Fuji TV",
              value: "1",
            },
            {
              title: "TV Asahi",
              value: "103",
            },
            {
              title: "TV Tokyo",
              value: "98",
            },
            {
              title: "BS TV Tokyo",
              value: "3471",
            },
            {
              title: "WOWOW",
              value: "172",
            },
            {
              title: "Kansai TV",
              value: "1163",
            },
            {
              title: "U-NEXT",
              value: "3869",
            },
            {
              title: "Paravi",
              value: "3879",
            },
            {
              title: "tvN",
              value: "866",
            },
            {
              title: "SBS",
              value: "156",
            },
            {
              title: "MBC",
              value: "97",
            },
            {
              title: "KBS1",
              value: "829",
            },
            {
              title: "KBS2",
              value: "342",
            },
            {
              title: "JTBC",
              value: "885",
            },
            {
              title: "Coupang Play",
              value: "5169",
            },
            {
              title: "Wavve",
              value: "3357",
            },
            {
              title: "TVING",
              value: "3897",
            },
            {
              title: "iQiyi",
              value: "1330",
            },
            {
              title: "Tencent Video",
              value: "2007",
            },
            {
              title: "Youku",
              value: "1419",
            },
            {
              title: "bilibili",
              value: "1605",
            },
            {
              title: "Mango TV",
              value: "1631",
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
      id: "companies",
      title: "出品公司",
      functionName: "companies",
      params: [
        {
          name: "with_companies",
          title: "出品公司",
          type: "enumeration",
          enumOptions: [
            {
              title: "迪士尼",
              value: "2",
            },
            {
              title: "华纳兄弟",
              value: "174",
            },
            {
              title: "哥伦比亚影业",
              value: "5",
            },
            {
              title: "索尼影业",
              value: "34",
            },
            {
              title: "环球影业",
              value: "33",
            },
            {
              title: "派拉蒙影业",
              value: "4",
            },
            {
              title: "二十世纪影业",
              value: "25",
            },
            {
              title: "Marvel",
              value: "420",
            },
          ]
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
      ]
    },
  ],
};

// 基础获取TMDB数据方法
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

async function nowPlaying(params) {
  const type = params.type;
  let api = "tv/on_the_air";
  if (type === "movie") {
    api = "movie/now_playing";
  }
  return await fetchData(api, params, type);
}

async function trending(params) {
  const timeWindow = params.time_window;
  const api = `trending/all/${timeWindow}`;
  delete params.time_window;
  return await fetchData(api, params);
}

async function popular(params) {
  const type = params.type;
  let api = `movie/popular`;
  if (type === "tv") {
    api = `tv/popular`;
  }
  delete params.type;
  return await fetchData(api, params, type);
}

async function topRated(params) {
  const type = params.type;
  let api = `movie/top_rated`;
  if (type === "tv") {
    api = `tv/top_rated`;
  }
  delete params.type;
  return await fetchData(api, params, type);
}

async function categories(params) {
  let genreId = params.with_genres;
  let type = params.type;
  const onlyMovieGenreIds = ["28", "53"];//动作，惊悚
  const onlyTvGenreIds = ["10762", "10764", "10766"];//儿童，真人秀，肥皂剧
  if (genreId == "878" && type == "tv") {
    genreId = "10765";
  }
  if (onlyMovieGenreIds.includes(genreId)) {
    type = "movie";
  }
  if (onlyTvGenreIds.includes(genreId)) {
    type = "tv";
  }
  const api = `discover/${type}`;
  params.with_genres = genreId;
  delete params.type;
  return await fetchData(api, params, type);
}

async function networks(params) {
  let api = `discover/tv`;
  delete params.type;
  return await fetchData(api, params);
}

async function companies(params) {
  let api = `discover/movie`;
  delete params.type;
  return await fetchData(api, params, "movie");
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
