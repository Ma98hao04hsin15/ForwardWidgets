var WidgetMetadata = {
  id: "imdb_watchlist",
  title: "IMDB Watchlist",
  description: "顯示你的 IMDB Watchlist",
  author: "你的名字",
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
    const $ = Widget.html.load(html);

    // 從 JSON-LD 數據抓影片列表（嵌在 script 標籤中）
    const jsonText = $('script[type="application/ld+json"]').html();
    const data = JSON.parse(jsonText);

    const items = Array.isArray(data.itemListElement) ? data.itemListElement : [];

    return items.map((item, index) => {
      const movie = item.item;
      return {
        id: movie['@id'] || movie.url,
        type: "url",
        title: movie.name,
        posterPath: movie.image,
        backdropPath: movie.image,
        releaseDate: movie.datePublished || "",
        mediaType: "movie",
        rating: movie.aggregateRating ? movie.aggregateRating.ratingValue : null,
        genreTitle: Array.isArray(movie.genre) ? movie.genre.join(" / ") : movie.genre,
        duration: null,
        durationText: null,
        previewUrl: null,
        videoUrl: null,
        link: movie.url,
        episode: 0,
        description: movie.description
      };
    });
  } catch (error) {
    console.error("載入失敗：", error);
    throw error;
  }
}
