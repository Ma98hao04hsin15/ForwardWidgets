var WidgetMetadata = {
  id: "tmdbPopular",
  title: "TMDB 熱門電影與劇集",
  description: "TMDB 熱門電影與劇集",
  author: "Joey",
  site: "https://example.com",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "熱門電影",
      functionName: "getPopularMovies",
      params: [
        { name: "page", type: "number", default: 1, description: "頁碼（可選）" }
      ]
    },
    {
      title: "熱門劇集",
      functionName: "getPopularTVShows",
      params: [
        { name: "page", type: "number", default: 1, description: "頁碼（可選）" }
      ]
    }
  ]
};

const API_KEY = "f558fc131f70f86049a00ee67fd1f422";
const BASE_IMAGE = "https://image.tmdb.org/t/p";

async function getPopularMovies(params = {}) {
  const page = params.page || 1;
  const lang = "zh-TW";
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=${lang}&page=${page}`;

  const res = await Widget.http.get(url);
  const results = res.data?.results || [];

  return results.map(movie => ({
    id: `movie_${movie.id}`,
    type: "link",
    title: movie.title || movie.original_title || "未命名",
    description: movie.overview || "（無簡介）",
    releaseDate: movie.release_date || "",
    posterPath: movie.poster_path ? `${BASE_IMAGE}/w500${movie.poster_path}` : "",
    backdropPath: movie.backdrop_path ? `${BASE_IMAGE}/w780${movie.backdrop_path}` : "",
    rating: Math.round(movie.vote_average * 10) / 10 || 0,
    link: `movie_${movie.id}`
  }));
}

async function getPopularTVShows(params = {}) {
  const page = params.page || 1;
  const lang = "zh-TW";
  const url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=${lang}&page=${page}`;

  const res = await Widget.http.get(url);
  const results = res.data?.results || [];

  return results.map(tv => ({
    id: `tv_${tv.id}`,
    type: "link",
    title: tv.name || tv.original_name || "未命名",
    description: tv.overview || "（無簡介）",
    releaseDate: tv.first_air_date || "",
    posterPath: tv.poster_path ? `${BASE_IMAGE}/w500${tv.poster_path}` : "",
    backdropPath: tv.backdrop_path ? `${BASE_IMAGE}/w780${tv.backdrop_path}` : "",
    rating: Math.round(tv.vote_average * 10) / 10 || 0,
    link: `tv_${tv.id}`
  }));
}

async function loadDetail(link) {
  const [type, id] = link.split("_");
  const lang = "zh-TW";

  const detailUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=${lang}`;
  const videoUrl = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}&language=${lang}`;

  const [detailRes, videoRes] = await Promise.all([
    Widget.http.get(detailUrl),
    Widget.http.get(videoUrl)
  ]);

  const detail = detailRes.data || {};
  const videos = videoRes.data?.results || [];

  const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");

  return {
    title: detail.title || detail.name || detail.original_title || detail.original_name || "未命名",
    description: detail.overview || "無簡介",
    videoUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
    posterPath: detail.poster_path ? `${BASE_IMAGE}/w500${detail.poster_path}` : "",
    backdropPath: detail.backdrop_path ? `${BASE_IMAGE}/w780${detail.backdrop_path}` : "",
    rating: Math.round(detail.vote_average * 10) / 10 || 0,
    releaseDate: detail.release_date || detail.first_air_date || "",
    genres: detail.genres?.map(g => g.name).join(", ") || "",
    runtime: detail.runtime
      ? `${detail.runtime} 分鐘`
      : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} 分鐘/集` : ""),
    link: detail.homepage || `https://www.themoviedb.org/${type}/${id}`
  };
}
