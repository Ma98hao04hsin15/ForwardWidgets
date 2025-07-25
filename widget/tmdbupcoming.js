var WidgetMetadata = {
  id: "tmdb_upcoming",
  title: "TMDb Upcoming",
  description: "显示 TMDb 上即将上映的电影列表",
  author: "Your Name",
  site: "https://www.themoviedb.org/",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "Upcoming Movies",
      description: "Fetch upcoming movies from TMDb",
      requiresWebView: false,
      functionName: "getUpcoming",
      sectionMode: false,
      cacheDuration: 3600,
      params: [
        {
          name: "page",
          title: "页面",
          type: "page",
          description: "页码（1 起）",
          value: 1
        }
      ]
    }
  ]
};
async function getUpcoming(params = {}) {
  const page = params.page || 1;
  const apiKey = "你的_TMDB_API_Key"; // 请替换为真实 key
  const url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=zh-TW&page=${page}`;

  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://themoviedb.org"
      }
    });

    const data = response.data;
    const results = data.results || [];

    return results.map(item => ({
      id: `movie.${item.id}`,
      type: "tmdb",
      title: item.title,
      posterPath: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
      backdropPath: `https://image.tmdb.org/t/p/w780${item.backdrop_path}`,
      releaseDate: item.release_date,
      mediaType: "movie",
      rating: item.vote_average.toFixed(1),
      genreTitle: "", // 可选：需要额外调用
      duration: 0,
      durationText: "",
      link: `https://www.themoviedb.org/movie/${item.id}`,
      description: item.overview
    }));
  } catch (e) {
    console.error("TMDb 获取失败：", e);
    throw e;
  }
}
