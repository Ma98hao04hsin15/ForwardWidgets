const WidgetMetadata = {
  id: "imdb.watchlist",
  title: "IMDb Watchlist",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "根據 IMDb 使用者的 Watchlist 生成片單（無需 API Key）",
  author: "Forward",
  site: "https://www.imdb.com/",
  modules: [
    {
      name: "watchlist",
      title: "IMDb 想看清單",
      functionName: "loadIMDbWatchlist",
      cacheDuration: 3600,
      params: [
        {
          name: "user_id",
          title: "IMDb 使用者 ID",
          type: "input",
          default: "ur204635540",
          placeholder: "例如 ur204635540"
        }
      ]
    }
  ]
};

async function loadIMDbWatchlist({ user_id }) {
  const url = `https://www.imdb.com/user/${user_id}/watchlist`;
  const res = await fetch(url);
  const html = await res.text();

  const imdbIds = Array.from(html.matchAll(/\/title\/(tt\d{7,8})\//g)).map(m => m[1]);
  const uniqueIds = [...new Set(imdbIds)].slice(0, 50); // 限制最多 50 筆

  const tmdbItems = await Promise.all(
    uniqueIds.map(async (imdbId) => {
      const tmdb = await tmdbFindByImdbId(imdbId);
      return tmdb;
    })
  );

  return tmdbItems.filter(Boolean);
}

async function tmdbFindByImdbId(imdb_id) {
  const url = `https://proxy.forwardapi.net/tmdb/find/${imdb_id}`;
  const res = await fetch(url);
  const data = await res.json();

  const item = data.movie_results?.[0] || data.tv_results?.[0];
  if (!item) return null;

  return {
    id: item.id,
    title: item.title || item.name,
    overview: item.overview,
    poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    year: (item.release_date || item.first_air_date || "").split("-")[0],
    tmdb_id: item.id,
    imdb_id,
    type: item.media_type || (data.movie_results?.length ? "movie" : "tv")
  };
}
