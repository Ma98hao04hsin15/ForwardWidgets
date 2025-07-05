// ==UserScript==
// @name         IMDb 熱門影集 × 地區篩選（無 TMDB API Key）
// @namespace    https://github.com/InchStudio/ForwardWidgets
// @version      1.0.0
// @description  抓取 IMDb 熱門影集榜單，結合 TMDB 地區資料過濾（無需 API Key）
// @author       Forward
// @match        *://*/*
// @grant        none
// ==/UserScript==

const axios = require("axios");
const cheerio = require("cheerio");

async function loadIMDBTVByCountry({ countryCode = "US" }) {
  const imdbUrl = "https://www.imdb.com/chart/tvmeter/?ref_=chttp_ql_5";
  const res = await axios.get(imdbUrl, {
    headers: { "Accept-Language": "en-US,en;q=0.5" }
  });

  const $ = cheerio.load(res.data);
  const items = [];

  $(".lister-list tr").each((_, el) => {
    const title = $(el).find(".titleColumn a").text().trim();
    const imdbId = $(el).find(".titleColumn a").attr("href")?.match(/\/title\/(tt\d+)/)?.[1];
    const year = $(el).find(".secondaryInfo").text().replace(/[()]/g, "");
    if (imdbId) {
      items.push({ title, imdbId, year });
    }
  });

  const result = [];

  for (const item of items) {
    try {
      const searchUrl = `https://www.themoviedb.org/search?query=${item.imdbId}`;
      const searchPage = await axios.get(searchUrl);
      const $$ = cheerio.load(searchPage.data);
      const firstResultHref = $$(".card.style_1").first().find("a").attr("href");
      const tmdbIdMatch = firstResultHref?.match(/\/tv\/(\d+)/);
      if (!tmdbIdMatch) continue;

      const tmdbId = tmdbIdMatch[1];
      const tmdbPage = await axios.get(`https://www.themoviedb.org/tv/${tmdbId}`);
      const $$$ = cheerio.load(tmdbPage.data);
      const originText = $$$(".facts .origin").text().trim();
      const posterPath = $$$(".poster img").attr("src");

      if (originText.includes(countryCode)) {
        result.push({
          title: item.title,
          subtitle: `${item.year} · ${originText}`,
          poster: posterPath?.startsWith("http") ? posterPath : `https://www.themoviedb.org${posterPath}`,
          url: `https://www.imdb.com/title/${item.imdbId}`
        });
      }

    } catch (err) {
      console.warn("Skip error:", item.title, err.message);
    }
  }

  return result;
}

const WidgetMetadata = {
  id: "imdb-region-filter",
  title: "IMDb 熱門影集 × 地區篩選",
  version: "1.0.0",
  description: "抓取 IMDb 熱門影集榜單，結合 TMDB 地區資料過濾（無需 API Key）",
  author: "Forward",
  modules: [
    {
      title: "依地區篩選",
      functionName: "loadIMDBTVByCountry",
      params: [
        {
          name: "countryCode",
          title: "地區代碼",
          type: "select",
          default: "US",
          options: [
            { title: "🇺🇸 美國", value: "US" },
            { title: "🇬🇧 英國", value: "GB" },
            { title: "🇯🇵 日本", value: "JP" },
            { title: "🇰🇷 韓國", value: "KR" },
            { title: "🇹🇼 台灣", value: "TW" },
            { title: "🇫🇷 法國", value: "FR" },
            { title: "🇩🇪 德國", value: "DE" },
          ]
        }
      ],
      cacheDuration: 3600
    }
  ]
};

module.exports = {
  loadIMDBTVByCountry,
  WidgetMetadata
};
