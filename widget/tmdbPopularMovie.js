var WidgetMetadata = {
  id: "tmdbPopular",
  title: "TMDB 熱門電影",
  description: "TMDB 熱門電影（可篩選類型）",
  author: "Joey",
  site: "https://example.com",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "熱門電影",
      functionName: "getPopularMovies",
      params: [
        {
          name: "genre",
          title: "電影類型",
          type: "select",
          options: [], // 程式中自動補上
          default: ""
        }
      ]
    }
  ]
};

const API_KEY = "f558fc131f70f86049a00ee67fd1f422";
const LANG = "zh-TW";

async function getPopularMovies(params = {}) {
  const genre = params.genre || "";
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=${LANG}&sort_by=popularity.desc${genre ? `&with_genres=${genre}` : ""}`;

  const res = await Widget.http.get(url);
  const results = res.data?.results || [];

  return results.map(movie => ({
    id: `movie_${movie.id}`,
    type: "link",
    title: movie.title || "未命名",
    description: movie.overview || "（無簡介）",
    releaseDate: movie.release_date || "",
    posterPath: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "",
    backdropPath: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
      : "",
    rating: movie.vote_average || 0,
    link: `movie_${movie.id}`
  }));
}

// genre 下拉選單動態設定
Widget.onInit = async () => {
  const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=${LANG}`;
  const res = await Widget.http.get(genreUrl);
  const genres = res.data?.genres || [];

  const module = WidgetMetadata.modules[0];
  const genreParam = module.params.find(p => p.name === "genre");
  if (genreParam) {
    genreParam.options = [
      { title: "全部", value: "" },
      ...genres.map(g => ({ title: g.name, value: String(g.id) }))
    ];
  }
};

async function loadDetail(link) {
  const [type, id] = link.split("_");
  const detailUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=${LANG}`;
  const videoUrl = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}&language=${LANG}`;

  const [detailRes, videoRes] = await Promise.all([
    Widget.http.get(detailUrl),
    Widget.http.get(videoUrl)
  ]);

  const detail = detailRes.data || {};
  const videos = videoRes.data?.results || [];

  const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");

  return {
    title: detail.title || "未命名",
    description: detail.overview || "無簡介",
    videoUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
    posterPath: detail.poster_path
      ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
      : "",
    backdropPath: detail.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${detail.backdrop_path}`
      : "",
    rating: detail.vote_average || 0,
    releaseDate: detail.release_date || "",
    link: detail.homepage || `https://www.themoviedb.org/${type}/${id}`
  };
}
