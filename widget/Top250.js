WidgetMetadata = {
  id: "tmdb.list",
  title: "TMDB 片單",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "自訂 TMDB 片單網址，抓取其中的電影或影集，支援 IMDb / 豆瓣 / 亞洲片單整理",
  author: "Forward",
  site: "https://www.themoviedb.org/",
  modules: [
    {
      title: "TMDB 片單",
      functionName: "loadItemsFromList",
      cacheDuration: 86400,
      params: [
        {
          name: "url",
          type: "input",
          title: "TMDB 片單網址",
          description: "請輸入以 https://www.themoviedb.org/list/ 開頭的網址",
          default: "https://www.themoviedb.org/list/634-top-250-imdb?language=zh-CN",
          placeholders: [
            {
              title: "IMDb Top 250",
              value: "https://www.themoviedb.org/list/634-top-250-imdb?language=zh-CN",
            },
            {
              title: "豆瓣电影 Top 250",
              value: "https://www.themoviedb.org/list/8231604-douban-top-250",
            },
            {
              title: "奥斯卡最佳影片（历届）",
              value: "https://www.themoviedb.org/list/8231601-oscar-best-pictures",
            },
            {
              title: "AFI 百年百大电影",
              value: "https://www.themoviedb.org/list/8231599-afi-100-years-100-movies",
            },
            {
              title: "Sight & Sound 最伟大电影（2022 版）",
              value: "https://www.themoviedb.org/list/8231603-sight-sound-100-greatest-films-2022",
            },
            {
              title: "烂番茄 Top 100 经典必看电影",
              value: "https://www.themoviedb.org/list/8231600-rotten-tomatoes-top-100",
            },
            {
              title: "金馬獎最佳影片（歷屆）",
              value: "https://www.themoviedb.org/list/8231610-golden-horse-best-pictures",
            },
            {
              title: "香港金像獎最佳影片（歷屆）",
              value: "https://www.themoviedb.org/list/8231611-hkfa-best-pictures",
            },
            {
              title: "大鐘獎最佳影片（韓國）",
              value: "https://www.themoviedb.org/list/8231612-grand-bell-awards-best-pictures",
            },
            {
              title: "青龍獎最佳影片（韓國）",
              value: "https://www.themoviedb.org/list/8231613-blue-dragon-awards-best-pictures",
            },
            {
              title: "日本電影旬報年度十大",
              value: "https://www.themoviedb.org/list/8231614-kinenote-top-10",
            },
            {
              title: "亞洲百大經典電影",
              value: "https://www.themoviedb.org/list/8231615-top-100-asian-cinema",
            },
            {
              title: "村上春樹推薦電影清單",
              value: "https://www.themoviedb.org/list/8231616-haruki-murakami-favorites",
            },
            {
              title: "豆瓣华语高分电影 Top 100",
              value: "https://www.themoviedb.org/list/8231617-douban-chinese-top-100",
            }
          ]
        }
      ]
    }
  ]
}


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
