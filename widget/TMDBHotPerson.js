const WidgetMetadata = {
  id: "tmdb.people",
  title: "TMDB 人氣人物",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "顯示 TMDB 上的人氣演員與導演，支援搜尋功能",
  author: "Forward",
  site: "https://www.themoviedb.org/person?language=zh-CN",
  detailCacheDuration: 21600,
  modules: [
    {
      title: "人氣人物",
      functionName: "loadPopularPeople",
      requiresWebView: false,
      params: []
    },
    {
      title: "搜尋人物",
      functionName: "searchPeople",
      requiresWebView: false,
      params: [
        {
          name: "keyword",
          type: "input",
          title: "關鍵字",
          description: "輸入人物名稱以搜尋 TMDB 上的演員或導演"
        }
      ]
    }
  ]
};

async function loadCardItems() {
  const url = "https://www.themoviedb.org/person?language=zh-CN";
  const html = await $http.get(url);
  const $ = cheerio.load(html);

  const cards = [];

  $(".people .card").each((index, el) => {
    const $el = $(el);
    const name = $el.find(".info h2").text().trim();
    const knownFor = $el.find(".info p").text().trim();
    const link = "https://www.themoviedb.org" + $el.find("a").attr("href");
    const image = $el.find(".image_content img").attr("data-src") || $el.find(".image_content img").attr("src");

    cards.push({
      title: name,
      description: knownFor,
      image,
      url: link
    });
  });

  return cards;
}

async function loadPopularPeople() {
  const url = "https://www.themoviedb.org/person?language=zh-CN";
  const html = await $http.get(url);
  const $ = cheerio.load(html);
  const cards = [];

  $(".people .card").each((i, el) => {
    const $el = $(el);
    const name = $el.find(".info h2").text().trim();
    const knownFor = $el.find(".info p").text().trim();
    const link = "https://www.themoviedb.org" + $el.find("a").attr("href");
    const image = $el.find(".image_content img").attr("data-src") || $el.find(".image_content img").attr("src");

    cards.push({
      title: name,
      description: knownFor,
      image,
      url: link
    });
  });

  return cards;
}

async function searchPeople({ keyword }) {
  if (!keyword) return [];

  const searchUrl = `https://www.themoviedb.org/search/person?query=${encodeURIComponent(keyword)}&language=zh-CN`;
  const html = await $http.get(searchUrl);
  const $ = cheerio.load(html);
  const cards = [];

  $(".card.person").each((i, el) => {
    const $el = $(el);
    const name = $el.find(".info h2").text().trim();
    const knownFor = $el.find(".info p").text().trim();
    const link = "https://www.themoviedb.org" + $el.find("a").attr("href");
    const image = $el.find(".image img").attr("data-src") || $el.find(".image img").attr("src");

    cards.push({
      title: name,
      description: knownFor,
      image,
      url: link
    });
  });

  return cards;
}
