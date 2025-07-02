WidgetMetadata = {
  id: "TraktList",
  title: "Trakt 清單顯示 (含 TMDB 資訊)",
  version: "1.0.0",
  description: "解析 Trakt 自創清單連結並轉為 TMDB 呈現",
  author: "Forward",
  site: "https://trakt.tv",
  modules: [
    {
      id: "traktlist",
      title: "Trakt 自創清單轉 TMDB",
      cacheDuration: 3600,
      requiresWebView: false,
      params: [
        {
          name: "list_url",
          type: "input",
          title: "Trakt 清單連結",
          description: "如：https://trakt.tv/users/USERNAME/lists/LISTNAME"
        },
        {
          name: "type",
          type: "select",
          title: "內容類型",
          options: [
            { title: "全部", value: "all" },
            { title: "電影", value: "movie" },
            { title: "影集", value: "show" }
          ],
          default: "all"
        }
      ],
      functionName: "loadTraktList"
    }
  ]
};

async function loadTraktList({ list_url, type }) {
  if (!list_url?.includes("trakt.tv")) {
    throw new Error("請輸入正確的 Trakt 清單連結");
  }

  const res = await fetch(list_url);
  const html = await res.text();

  const imdbIdRegex = /data-imdb-id="(tt\d{7,8})"/g;
  const typeRegex = /data-type="(movie|show)"/g;

  const ids = [];
  let matchImdb, matchType;
  while ((matchImdb = imdbIdRegex.exec(html)) && (matchType = typeRegex.exec(html))) {
    if (matchImdb && matchType) {
      ids.push({
        imdb: matchImdb[1],
        type: matchType[1]
      });
    }
  }

  const filtered = type === "all" ? ids : ids.filter(i => i.type === type);

  const tmdbResults = await Promise.all(
    filtered.map(async ({ imdb, type }) => {
      const tmdb = await fetchTMDBByImdb(imdb, type);
      return tmdb ? { ...tmdb, type } : null;
    })
  );

  return tmdbResults.filter(Boolean);
}

async function fetchTMDBByImdb(imdbID, type) {
  try {
    const url = `https://www.themoviedb.org/${type}/${imdbID}`;
    const res = await fetch(url);
    const html = await res.text();

    const idMatch = html.match(/href="\/(movie|tv)\/(\d+)-/);
    const titleMatch = html.match(/<title>(.*?) \(\d{4}\)/);
    const posterMatch = html.match(/"poster lazyload" data-src="([^"]+)"/);
    const yearMatch = html.match(/\((\d{4})\)/);

    if (!idMatch || !titleMatch) return null;

    return {
      id: idMatch[2],
      title: titleMatch[1],
      poster: posterMatch ? posterMatch[1] : "",
      year: yearMatch ? yearMatch[1] : "",
      url: `https://www.themoviedb.org/${idMatch[1]}/${idMatch[2]}`
    };
  } catch (err) {
    return null;
  }
}
