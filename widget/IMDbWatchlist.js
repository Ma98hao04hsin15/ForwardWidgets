var WidgetMetadata = {
  id: "imdb_watchlist",
  title: "IMDB Watchlist",
  description: "顯示你的 IMDB Watchlist",
  author: "Joy",
  site: "https://www.imdb.com",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,

  modules: [
    {
      title: "我的 Watchlist",
      description: "載入 IMDB Watchlist 頁面",
      requiresWebView: false,
      functionName: "loadWatchlist",
      sectionMode: false,
      cacheDuration: 3600,
      params: [
        {
          name: "userId",
          title: "IMDB 使用者 ID",
          type: "input",
          description: "例如：ur204635540",
          value: "ur204635540"
        }
      ]
    }
  ]
};
async function loadWatchlist(params = {}) {
  try {
    const userId = params.userId || "ur204635540";
    const url = `https://www.imdb.com/user/${userId}/watchlist`;

    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://www.imdb.com"
      }
    });

    const html = response.data;

    // 提取 window.__INITIAL_STATE__ 變數中的 JSON
    const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});<\/script>/s);
    if (!match || match.length < 2) {
      throw new Error("無法找到 __INITIAL_STATE__");
    }

    const state = JSON.parse(match[1]);
    const listItems = state?.lists?.byId?.[`ls${state.watchlist.listId}`]?.items;

    if (!listItems || listItems.length === 0) {
      throw new Error("Watchlist 是空的或無法讀取資料");
    }

    return listItems.map(item => {
      const id = item.const;
      const title = item.primary?.title || "未知標題";
      const image = item.primary?.image?.url;
      const year = item.primary?.year;
      const rating = item.ratingsSummary?.aggregateRating;
      const genres = item.genres?.join(" / ");
      const description = item.primary?.description || "";

      return {
        id: `imdb.${id}`,
        type: "imdb",
        title,
        posterPath: image,
        backdropPath: image,
        releaseDate: year ? `${year}-01-01` : "",
        mediaType: "movie",
        rating: rating ? rating.toString() : null,
        genreTitle: genres,
        duration: null,
        durationText: null,
        previewUrl: null,
        videoUrl: null,
        link: `https://www.imdb.com/title/${id}/`,
        episode: 0,
        description
      };
    });
  } catch (error) {
    console.error("解析 Watchlist 失敗：", error);
    throw error;
  }
}
