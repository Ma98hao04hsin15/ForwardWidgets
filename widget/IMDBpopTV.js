WidgetMetadata = {
  id: "IMDbTVMeterFiltered",
  title: "IMDb TV排行榜 (平台×地區 篩選)",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "從 IMDb TV排行榜抓取資料，透過 TMDB 取得播放平台與製作地區資訊進行篩選，無需 API Key。",
  author: "Forward",
  modules: [
    {
      title: "IMDb TV排行榜（可篩選）",
      functionName: "loadIMDbTVMeterWithFilter",
      requiresWebView: false,
      cacheDuration: 3600,
      params: [
        {
          name: "region_filter",
          title: "製作地區",
          type: "select",
          default: "US",
          options: [
            { title: "🇺🇸 美國", value: "US" },
            { title: "🇰🇷 韓國", value: "KR" },
            { title: "🇯🇵 日本", value: "JP" },
            { title: "🇬🇧 英國", value: "GB" },
            { title: "🇹🇼 台灣", value: "TW" },
            { title: "🇨🇳 中國", value: "CN" }
          ]
        },
        {
          name: "platform_filter",
          title: "播放平台",
          type: "select",
          default: "Netflix",
          options: [
            { title: "Netflix", value: "Netflix" },
            { title: "Disney+", value: "Disney+" },
            { title: "HBO Max", value: "HBO Max" },
            { title: "Amazon Prime", value: "Amazon Prime Video" },
            { title: "Apple TV+", value: "Apple TV+" },
            { title: "Viu", value: "Viu" },
            { title: "iQIYI", value: "iQIYI" }
          ]
        }
      ]
    }
  ]
};

async function loadIMDbTVMeterWithFilter({ region_filter = "US", platform_filter = "Netflix" }) {
  const imdbIDs = await fetchIMDbTVMeterList();

  const results = [];
  for (const imdbID of imdbIDs) {
    const tmdbInfo = await getTMDBInfoFromIMDbID(imdbID);
    if (!tmdbInfo) continue;

    const tvDetails = await getTVDetails(tmdbInfo.id);
    if (!tvDetails) continue;

    const regionMatch = tvDetails.origin_country?.includes(region_filter);
    const providers = tvDetails["watch/providers"]?.results?.[region_filter]?.flatrate || [];
    const platformMatch = providers.some(p =>
      p.provider_name.toLowerCase().includes(platform_filter.toLowerCase())
    );

    if (regionMatch && platformMatch) {
      results.push({
        title: tvDetails.name,
        description: tvDetails.overview,
        image: `https://image.tmdb.org/t/p/w500${tvDetails.poster_path}`,
        link: `https://www.imdb.com/title/${imdbID}/`,
        data: {
          地區: tvDetails.origin_country.join(", "),
          播放平台: providers.map(p => p.provider_name).join(", ")
        }
      });
    }
  }

  return results;
}

// ========== 工具函數區 ==========

async function fetchIMDbTVMeterList() {
  const res = await fetch("https://www.imdb.com/chart/tvmeter/");
  const html = await res.text();
  const imdbIds = [...html.matchAll(/\/title\/(tt\d+)\//g)].map(match => match[1]);
  return [...new Set(imdbIds)];
}

async function getTMDBInfoFromIMDbID(imdbID) {
  const url = `https://api.themoviedb.org/3/find/${imdbID}?external_source=imdb_id&language=zh-TW`;
  const res = await fetch(url);
  const data = await res.json();
  return data.tv_results?.[0];
}

async function getTVDetails(tvId) {
  const url = `https://api.themoviedb.org/3/tv/${tvId}?append_to_response=watch/providers&language=zh-TW`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}
