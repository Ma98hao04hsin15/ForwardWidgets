const WidgetMetadata = {
  id: "Trakt",
  title: "Trakt我看&Trakt个性化推荐",
  version: "1.0.13",
  requiredVersion: "0.0.1",
  description:
    "解析Trakt想看、在看、已看、片单、追剧日历以及个性化推荐，支持丰富播放平台筛选【五折码：CHEAP.5;七折码：CHEAP】",
  author: "huangxd + ChatGPT",
  site: "https://github.com/huangxd-/ForwardWidgets",
  modules: [
    {
      title: "trakt我看",
      requiresWebView: false,
      functionName: "loadInterestItems",
      cacheDuration: 3600,
      params: [
        {
          name: "user_name",
          title: "用户名",
          type: "input",
          description:
            "需在Trakt设置里打开隐私开关，未填写情况下接口不可用",
        },
        {
          name: "status",
          title: "状态",
          type: "enumeration",
          enumOptions: [
            { title: "想看", value: "watchlist" },
            { title: "在看", value: "progress" },
            { title: "看过-电影", value: "history/movies/added/asc" },
            { title: "看过-电视", value: "history/shows/added/asc" },
            {
              title: "随机想看(从想看列表中无序抽取9个影片)",
              value: "random_watchlist",
            },
          ],
        },
        {
          name: "platformFilters",
          title: "播放平台筛选",
          type: "enumeration",
          multiple: true,
          enumOptions: [
            // 日本电视台
            { title: "NHK", value: "NHK" },
            { title: "Fuji TV", value: "Fuji TV" },
            { title: "NTV (日本电视台)", value: "NTV" },
            { title: "TBS", value: "TBS" },
            { title: "TV Tokyo", value: "TV Tokyo" },
            { title: "WOWOW", value: "WOWOW" },
            // 韩国电视台
            { title: "KBS", value: "KBS" },
            { title: "MBC", value: "MBC" },
            { title: "SBS", value: "SBS" },
            { title: "tvN", value: "tvN" },
            { title: "JTBC", value: "JTBC" },
            // 美国电视台
            { title: "NBC", value: "NBC" },
            { title: "CBS", value: "CBS" },
            { title: "ABC", value: "ABC" },
            { title: "FOX", value: "FOX" },
            { title: "HBO", value: "HBO" },
            { title: "Showtime", value: "Showtime" },
            // 流媒体
            { title: "Netflix", value: "Netflix" },
            { title: "Disney+", value: "Disney+" },
            { title: "Amazon Prime Video", value: "Amazon Prime" },
            { title: "Hulu", value: "Hulu" },
            { title: "Apple TV+", value: "Apple TV+" },
            { title: "Paramount+", value: "Paramount+" },
            { title: "Starz", value: "Starz" },
          ],
          description: "多选，选择想筛选的播放平台。为空表示不筛选。",
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
    },
    // 这里可以继续加其它模块，如 Trakt个性化推荐、Trakt片单、追剧日历，保持原样即可
  ],
};

// 硬编码平台ID
const PLATFORM_IDS = {
  NHK: 2716,
  "Fuji TV": 2440,
  NTV: 328,
  TBS: 291,
  "TV Tokyo": 233,
  WOWOW: 1574,
  KBS: 2142,
  MBC: 2119,
  SBS: 2361,
  tvN: 2189,
  JTBC: 2339,
  NBC: 4,
  CBS: 5,
  ABC: 9,
  FOX: 10,
  HBO: 49,
  Showtime: 46,
  Netflix: 213,
  "Disney+": 337,
  "Amazon Prime": 1024,
  Hulu: 453,
  "Apple TV+": 2552,
  "Paramount+": 531,
  Starz: 97,
};

// IMDb ID → TMDb 播放平台 ID 查询示范，需替换为你项目的接口
async function fetchTmdbNetworksByImdbId(imdbId) {
  try {
    let tmdbInfo = await forward.tmdb.fetchByImdb(imdbId);
    if (tmdbInfo && tmdbInfo.networks) {
      return tmdbInfo.networks.map((net) => net.id);
    }
    return [];
  } catch {
    return [];
  }
}

// 播放平台筛选函数
async function filterByPlatform(imdbItems, selectedPlatforms = []) {
  if (!selectedPlatforms || selectedPlatforms.length === 0) return imdbItems;

  const platformIds = selectedPlatforms
    .map((p) => PLATFORM_IDS[p])
    .filter(Boolean);

  let filteredItems = [];
  for (const item of imdbItems) {
    let networks = await fetchTmdbNetworksByImdbId(item.id);
    if (networks.some((id) => platformIds.includes(id))) {
      filteredItems.push(item);
    }
  }
  return filteredItems;
}

// Trakt HTML抓取和IMDb ID解析相关函数（保持和你原来一致）
async function fetchTraktData(url, headers = {}, status, minNum, maxNum, random = false, order = "") {
  try {
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                ...headers, // 允许附加额外的头
            },
        });

        console.log("请求结果:", response.data);

        let traktUrls = [];
        if (status === "progress") {
            traktUrls = extractTraktUrlsInProgress(response.data, minNum, maxNum);
        } else {
            traktUrls = extractTraktUrlsFromResponse(response.data, minNum, maxNum, random);
        }

        if (order === "desc") {
            traktUrls = traktUrls.reverse();
        }

        return await fetchImdbIdsFromTraktUrls(traktUrls);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

// 主业务函数，示范 loadInterestItems 支持播放平台筛选
async function loadInterestItems(params = {}) {
  const page = params.page || 1;
  const userName = params.user_name || "";
  let status = params.status || "";
  const random = status === "random_watchlist";
  if (random) status = "watchlist";

  const count = 20;
  const size = status === "watchlist" ? 6 : 3;
  const minNum = ((page - 1) % size) * count + 1;
  const maxNum = ((page - 1) % size) * count + 20;
  const traktPage = Math.floor((page - 1) / size) + 1;

  if (!userName) {
    throw new Error("必须提供 Trakt 用户名");
  }

  if (random && page > 1) {
    return [];
  }

  let url = `https://trakt.tv/users/${userName}/${status}?page=${traktPage}`;

  let result = await fetchTraktData(url, {}, status, minNum, maxNum, random);

  if (params.platformFilters && params.platformFilters.length > 0) {
    result = await filterByPlatform(result, params.platformFilters);
  }
  return result;
}
