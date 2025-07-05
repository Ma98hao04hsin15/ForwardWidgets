WidgetMetadata = {
  id: "forward.tmdb",
  title: "TMDB",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "获取 TMDB 的片单数据",
  author: "Forward + Joy",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "list",
      title: "片单",
      functionName: "list",
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "input",
          description: "TMDB 片单地址",
          placeholders: [
            {
              title: "奥斯卡金像奖",
              value: "https://www.themoviedb.org/list/8512095-2025-oscar-nominations-for-best-picture-97th-academy-awards",
            },
            {
              title: "IMDb Top 250",
              value: "https://www.themoviedb.org/list/634-top-250-imdb?language=zh-CN",
            },
            {
              title: "韓劇推薦（KR Drama）",
              value: "https://www.themoviedb.org/list/8540446-kr-drama",
            },
          ],
        },
      ],
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

  // 请求片单页面
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

  // 解析 HTML 得到元素
  const $ = Widget.html.load(response.data);

  const coverElements = $(".block.aspect-poster");

  let tmdbIds = [];
  for (const itemId of coverElements) {
    const $item = $(itemId);
    const link = $item.attr("href");
    if (!link) {
      continue;
    }
    const match = link.match(/^\/(movie|tv)\/([^\/-]+)-/);
    const type = match?.[1];
    const id = match?.[2];
    if (id && type) {
      tmdbIds.push({ id: `${type}.${id}`, type: "tmdb" });
    }
  }

  return tmdbIds;
}
