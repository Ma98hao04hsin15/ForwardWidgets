// traktFavoritesNoApi.js

export const WidgetMetadata = {
  id: "Trakt",
  title: "Trakt我看&Trakt个性化推荐",
  version: "1.0.1",
  modules: [
    {
      id: "favorites",
      title: "Trakt Favorites（可地區篩選，無API Key）",
      functionName: "loadTraktFavorites",
      params: [
        {
          name: "user_name",
          type: "input",
          title: "Trakt 使用者名稱",
          default: "joy98ma0415"
        },
        {
          name: "region",
          type: "select",
          title: "地區篩選",
          options: [
            { title: "全部", value: "" },
            { title: "日劇", value: "JP" },
            { title: "韓劇", value: "KR" },
            { title: "美劇", value: "US" },
            { title: "英劇", value: "GB" },
            { title: "台劇", value: "TW" },
            { title: "陸劇", value: "CN" }
          ]
        }
      ],
      cacheDuration: 3600
    }
  ]
};

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });
  return await res.text();
}

async function imdbIdToTmdbId(imdbId, mediaType = "tv") {
  const queryUrl = `https://www.themoviedb.org/search?query=${imdbId}`;
  const html = await fetchHtml(queryUrl);
  const regex = new RegExp(`href="/${mediaType}/(\\d+)"`, "g");
  const match = regex.exec(html);
  if (!match) return null;
  return match[1];
}

async function fetchTmdbDetailsById(id, mediaType = "tv") {
  if (!id) return null;
  const url = `https://www.themoviedb.org/${mediaType}/${id}`;
  const html = await fetchHtml(url);
  const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  if (!jsonMatch) return null;
  try {
    const jsonData = JSON.parse(jsonMatch[1]);
    const mediaData = jsonData.props.pageProps.tv || jsonData.props.pageProps.movie;
    if (!mediaData) return null;
    const origin_country = mediaData.origin_country || (mediaData.production_countries ? mediaData.production_countries.map(c => c.iso_3166_1) : []);
    const title = mediaData.name || mediaData.title || "";
    const release_date = mediaData.first_air_date || mediaData.release_date || "";
    const poster_path = mediaData.poster_path || "";
    return {
      origin_country,
      title,
      release_date,
      poster_path
    };
  } catch {
    return null;
  }
}

export async function loadTraktFavorites(params) {
  const { user_name, region } = params;
  const traktUrl = `https://trakt.tv/users/${user_name}/favorites?sort=rank,asc`;
  const traktHtml = await fetchHtml(traktUrl);
  const imdbIds = [...traktHtml.matchAll(/www.imdb.com\/title\/(tt\d+)/g)].map(m => m[1]);
  const uniqueImdbIds = [...new Set(imdbIds)];
  const results = [];

  for (const imdbId of uniqueImdbIds) {
    // 嘗試先用 TV 取得 TMDB ID
    let tmdbId = await imdbIdToTmdbId(imdbId, "tv");
    let details = await fetchTmdbDetailsById(tmdbId, "tv");

    if (!details) {
      // TV 沒有就嘗試 Movie
      tmdbId = await imdbIdToTmdbId(imdbId, "movie");
      details = await fetchTmdbDetailsById(tmdbId, "movie");
    }

    if (!details) continue;

    const origin = details.origin_country?.[0] || "";

    if (region && region !== "" && origin !== region) continue;

    results.push({
      title: details.title,
      subtitle: `地區：${origin || "未知"}｜年份：${details.release_date ? details.release_date.slice(0, 4) : "未知"}`,
      poster: details.poster_path
        ? `https://www.themoviedb.org/t/p/w300_and_h450_face${details.poster_path}`
        : "",
      url: `https://www.imdb.com/title/${imdbId}`
    });
  }

  return results;
}
