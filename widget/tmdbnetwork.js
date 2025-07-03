WidgetMetadata = 
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
        // 🇺🇸 美國平台
        { title: "Netflix", value: "213" },
        { title: "HBO", value: "49" },
        { title: "HBO Max", value: "3186" },
        { title: "Hulu", value: "453" },
        { title: "Disney+", value: "2739" },
        { title: "Apple TV+", value: "2552" },
        { title: "Amazon Prime Video", value: "1024" },
        { title: "Peacock", value: "3353" },
        { title: "Paramount+", value: "2076" },
        { title: "CBS", value: "16" },
        { title: "NBC", value: "6" },
        { title: "ABC", value: "2" },
        { title: "FOX", value: "19" },
        { title: "Showtime", value: "67" },
        { title: "The CW", value: "71" },
        { title: "FX", value: "88" },
        { title: "AMC", value: "174" },
        { title: "Starz", value: "318" },

        // 🇯🇵 日本平台
        { title: "NHK", value: "372" },
        { title: "TBS", value: "343" },
        { title: "TV Tokyo", value: "315" },
        { title: "Fuji TV", value: "350" },
        { title: "Nippon TV", value: "367" },
        { title: "WOWOW", value: "370" },
        { title: "BS-TBS", value: "4227" },
        { title: "BS Fuji", value: "4245" },
        { title: "dTV", value: "4683" },
        { title: "TV Asahi", value: "371" },

        // 🇰🇷 韓國平台
        { title: "tvN", value: "4430" },
        { title: "JTBC", value: "4341" },
        { title: "KBS2", value: "4353" },
        { title: "KBS1", value: "4352" },
        { title: "MBC", value: "4361" },
        { title: "SBS", value: "4351" },
        { title: "ENA", value: "1952" },
        { title: "OCN", value: "4215" },
        { title: "TVING", value: "8592" },
        { title: "wavve", value: "8404" },
        { title: "Coupang Play", value: "10380" },
        { title: "Channel A", value: "8049" },

        // 🇨🇳 中國平台
        { title: "爱奇艺", value: "3235" },
        { title: "腾讯视频", value: "1981" },
        { title: "优酷", value: "3154" },
        { title: "哔哩哔哩", value: "6176" },
        { title: "芒果TV", value: "6178" }
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
      value: "zh-CN"
    }
  ]
}

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

async function upcoming(params) {
  const api = "movie/upcoming";
  return await fetchData(api, params, "movie");
}

async function upcomingTv(params) {
  const today = new Date().toISOString().split("T")[0];

  const discoverParams = {
    ...params,
    sort_by: "first_air_date.asc",
    "first_air_date.gte": today,
    include_null_first_air_dates: false,
  };

  const api = "discover/tv";
  return await fetchData(api, discoverParams, "tv");
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
