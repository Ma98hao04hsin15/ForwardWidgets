var WidgetMetadata = {
  id: "letterboxd.list.bailey0.best",
  title: "Letterboxd Everyone Says Best",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "解析 Letterboxd 清單：Movies Everyone Tells You Are the Best Movies",
  author: "Forward",
  site: "https://letterboxd.com/bailey0/list/movies-everyone-tells-you-are-the-best-movies/",
  modules: [
    {
      id: "letterboxdList",
      title: "Letterboxd片單",
      functionName: "loadItems",
      requiresWebView: false,
      cacheDuration: 86400
    }
  ]
};

async function loadItems() {
  const url = "https://letterboxd.com/bailey0/list/movies-everyone-tells-you-are-the-best-movies/";
  const html = await $http.get(url).then(res => res.data);
  const list = [];

  const regex = /data-film-id="(\d+)"[\s\S]*?data-film-slug="([^"]+)"[\s\S]*?data-film-name="([^"]+)"[\s\S]*?data-film-release-year="(\d{4})"/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const [, filmId, slug, name, year] = match;
    const poster = `https://a.ltrbxd.com/resized/film-poster/${filmId}/-300-450-0-70.jpg`; // fallback 圖
    const link = `https://letterboxd.com${slug}`;
    list.push({
      title: name,
      subtitle: year,
      image: poster,
      url: link,
      id: filmId
    });
  }

  return list;
}
