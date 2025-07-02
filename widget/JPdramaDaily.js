WidgetMetadata = {
  id: "tmdb.japan.tv",
  title: "日劇播放平台",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "依據 TMDB 播放平台與年份，顯示日本地區的電視劇集",
  author: "Forward",
  site: "https://www.themoviedb.org/",
  modules: [
    {
      title: "日劇平台篩選",
      functionName: "loadJapaneseTVByPlatform",
      cacheDuration: 3600,
      params: [
        {
          name: "platform",
          title: "播放平台",
          type: "select",
          default: "213",
          options: [
            { title: "Netflix", value: "213" },
            { title: "NHK", value: "236" },
            { title: "TBS", value: "317" },
            { title: "TV Asahi", value: "231" },
            { title: "TV Tokyo", value: "269" },
            { title: "WOWOW", value: "273" },
            { title: "Fuji TV", value: "2368" },
            { title: "Amazon", value: "318" },
            { title: "Hulu Japan", value: "233" },
            { title: "Paravi", value: "2716" },
            { title: "U-NEXT", value: "2405" },
            { title: "AbemaTV", value: "2449" }
          ]
        },
        {
          name: "year",
          title: "年份",
          type: "input",
          default: new Date().getFullYear().toString()
        }
      ]
    }
  ]
};

// === 資料載入函數 ===
async function loadJapaneseTVByPlatform({ platform, year }) {
  const url = `https://api.themoviedb.org/3/discover/tv?with_networks=${platform}&first_air_date_year=${year}&sort_by=popularity.desc&language=zh-TW&region=JP`;
  const res = await fetch(`https://tmdb.apps.qudram.com/3/discover/tv?with_networks=${platform}&first_air_date_year=${year}&sort_by=popularity.desc&language=zh-TW&region=JP`);
  const json = await res.json();
  return json.results.map(item => ({
    title: item.name,
    subtitle: `${item.first_air_date || "未知年份"}｜評分 ${item.vote_average}`,
    image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    link: `https://www.themoviedb.org/tv/${item.id}`
  }));
}
