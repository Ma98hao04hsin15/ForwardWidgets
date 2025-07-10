// trakt组件
WidgetMetadata = {
    id: "Trakt",
    title: "Trakt我看&Trakt个性化推荐",
    modules: [
    {
        id: "personDetail",
        title: "人物資料",
        functionName: "loadPersonById",
        params: [
        {
            name: "id",
            type: "input",
            title: "TMDB 人物 ID",
            default: "287", // 例如 Brad Pitt
            {
                name: "page",
                title: "页码",
                type: "page"
                },
            ],
        },
    ],
    version: "1.0.11",
    requiredVersion: "0.0.1",
    description: "解析Trakt想看、在看、已看、片单、追剧日历以及根据个人数据生成的个性化推荐【五折码：CHEAP.5;七折码：CHEAP】",
    author: "huangxd",
    site: "https://github.com/huangxd-/ForwardWidgets"
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
        genreTitle: genreTitleWith(item.genre_ids),
      };
    });
    return result;
  } catch (error) {
    console.error("调用 TMDB API 失败:", error);
    throw error;
  }
}


async function loadPersonById({ id }) {
  const res = await fetch(`https://www.themoviedb.org/person/${id}?language=zh-TW`);
  const html = await res.text();

  const nameMatch = html.match(/<title>(.*?) -.*?<\/title>/);
  const imgMatch = html.match(/<img class="profile" src="(.*?)"/);
  const descMatch = html.match(/<div class="content">[\s\S]*?<p>(.*?)<\/p>/);

  const name = nameMatch?.[1] || "Unknown";
  const img = imgMatch?.[1] ? `https://www.themoviedb.org${imgMatch[1]}` : "";
  const desc = descMatch?.[1]?.replace(/<[^>]+>/g, '') || "";

  return {
    title: name,
    description: desc,
    image: img,
    link: `https://www.themoviedb.org/person/${id}`,
    items: [
      {
        title: name,
        subtitle: desc,
        image: img,
        link: `https://www.themoviedb.org/person/${id}`
      }
    ]
  };
}

