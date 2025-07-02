// imdb-tvmeter-filtered.js

WidgetMetadata = {
  id: "IMDbTVMeterFiltered",
  title: "IMDb 热门 TV 榜（可筛选地区与平台）",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "从 IMDb 热门 TV 榜抓取节目并按 TMDB 播出平台与地区筛选，无需 API Key",
  author: "Forward",
  modules: [
    {
      title: "IMDb 热门 TV 榜筛选",
      functionName: "loadIMDbTVMeterFiltered",
      cacheDuration: 3600,
      params: [
        {
          name: "region",
          title: "地区代码",
          type: "input",
          default: "TW",
          description: "如：TW（台湾）、US（美国）、KR（韩国）、JP（日本）",
        },
        {
          name: "platform",
          title: "播放平台关键字",
          type: "input",
          default: "Netflix",
          description: "如：Netflix、Disney、friDay、Prime",
        }
      ]
    }
  ]
};

async function loadIMDbTVMeterFiltered({ region = "TW", platform = "Netflix" }) {
  const imdbIDs = await fetchIMDbTVMeterList();
  const results = [];

  for (const imdbID of imdbIDs) {
    const tmdbInfo = await getTMDBInfoFromIMDbID(imdbID);
    if (!tmdbInfo) continue;

    const tvDetails = await getTVDetails(tmdbInfo.id);
    if (!tvDetails) continue;

    if (!filterTVShow(tvDetails, region, platform)) continue;

    results.push({
      title: tvDetails.name,
      description: tvDetails.overview,
      image: `https://image.tmdb.org/t/p/w500${tvDetails.poster_path}`,
      link: `https://www.imdb.com/title/${imdbID}/`,
      tags: [
        ...tvDetails.origin_country,
        ...(tvDetails["watch/providers"]?.results?.[region]?.flatrate || []).map(p => p.provider_name)
      ]
    });

    if (results.length >= 30) break; // 避免載入太多
  }

  return results;
}

// --- IMDb 榜單抓取 ---
async function fetchIMDbTVMeterList() {
  const res = await fetch("https://www.imdb.com/chart/tvmeter/");
  const html = await res.text();
  const matches = [...html.matchAll(/\/title\/(tt\d+)\//g)];
  const ids = matches.map(m => m[1]);
  return [...new Set(ids)];
}

// --- 利用 IMDb ID 查詢 TMDB 資料 ---
async function getTMDBInfoFromIMDbID(imdbID) {
  const res = await fetch(`https://api.themoviedb.org/3/find/${imdbID}?external_source=imdb_id`);
  const json = await res.json();
  return json.tv_results?.[0];
}

async function getTVDetails(tvId) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?append_to_response=watch/providers`);
  if (!res.ok) return null;
  return await res.json();
}

// --- 篩選 ---
function filterTVShow(tv, region, platformKeyword) {
  const regionMatch = tv.origin_country?.includes(region);
  const providers = tv["watch/providers"]?.results?.[region]?.flatrate || [];
  const platformMatch = providers.some(p =>
    p.provider_name.toLowerCase().includes(platformKeyword.toLowerCase())
  );
  return regionMatch && platformMatch;
}
