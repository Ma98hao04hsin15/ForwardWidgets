WidgetMetadata.modules.push({
  title: "Trakt高级筛选（年份/类型/平台）",
  requiresWebView: false,
  functionName: "loadWatchlistByAdvancedFilter",
  cacheDuration: 43200,
  params: [
    {
      name: "user_name",
      title: "用户名",
      type: "input",
      description: "Trakt 用户名，需设置隐私为公开",
    },
    {
      name: "year_range",
      title: "年份区间",
      type: "input",
      description: "格式如：2020-2023，支持单年或范围，允许开区间（如1900-或-2025）",
    },
    {
      name: "media_type",
      title: "类型",
      type: "enumeration",
      enumOptions: [
        { title: "全部", value: "" },
        { title: "电影", value: "movie" },
        { title: "剧集", value: "show" },
      ],
    },
    {
      name: "platform_ids",
      title: "播放平台（多选）",
      type: "enumeration",
      multi: true,
      enumOptions: [
        { title: "全部平台", value: "" },
        // 欧美主流平台
        { title: "Netflix", value: "213" },
        { title: "Amazon Prime Video", value: "1024" },
        { title: "Disney+", value: "2739" },
        { title: "HBO Max", value: "49" },
        { title: "Apple TV+", value: "2552" },
        { title: "Hulu", value: "453" },
        { title: "Paramount+", value: "531" },
        { title: "Starz", value: "2833" },
        { title: "Peacock", value: "3867" },
        { title: "BBC", value: "32" },
        { title: "Showtime", value: "71" },
        { title: "Crave", value: "364" },
        { title: "Cinemax", value: "120" },
        { title: "Star+", value: "3175" },
        // 日剧平台
        { title: "NHK", value: "2716" },
        { title: "Fuji TV", value: "2440" },
        { title: "NTV（日本电视台）", value: "328" },
        { title: "TBS", value: "291" },
        { title: "TV Tokyo", value: "233" },
        { title: "WOWOW", value: "498" },
        { title: "MBS", value: "639" },
        { title: "TV Asahi", value: "1570" },
        // 韩剧平台
        { title: "SBS（韩国）", value: "538" },
        { title: "KBS（韩国）", value: "1551" },
        { title: "MBC（韩国）", value: "1140" },
        { title: "tvN（韩国）", value: "2400" },
      ],
      description: "可多选，选中即筛选包含任一所选平台的影片",
    },
    {
      name: "page",
      title: "页码",
      type: "page",
    },
  ],
});

async function loadWatchlistByAdvancedFilter(params = {}) {
  const page = params.page || 1;
  const userName = params.user_name || "";
  const yearRange = params.year_range || "";
  const mediaType = params.media_type || "";
  const platformIdsRaw = params.platform_ids || [];

  if (!userName || !yearRange) {
    throw new Error("必须提供 Trakt 用户名 和 年份区间");
  }

  let [startYearRaw, endYearRaw] = yearRange.split("-").map((y) => y.trim());

  let startYear = parseInt(startYearRaw, 10);
  let endYear = parseInt(endYearRaw, 10);

  if (isNaN(startYear)) startYear = 0;
  if (isNaN(endYear)) endYear = 9999;

  if (!endYearRaw && !isNaN(startYear)) {
    endYear = startYear;
  }

  if (startYear > endYear) {
    const tmp = startYear;
    startYear = endYear;
    endYear = tmp;
  }

  // 平台 ID 处理，多选转 Set
  const platformIdSet = new Set();
  if (Array.isArray(platformIdsRaw)) {
    platformIdsRaw.forEach((idStr) => {
      const idNum = parseInt(idStr, 10);
      if (!isNaN(idNum) && idNum !== 0) platformIdSet.add(idNum);
    });
  } else if (typeof platformIdsRaw === "string") {
    platformIdsRaw.split(",").forEach((idStr) => {
      const idNum = parseInt(idStr.trim(), 10);
      if (!isNaN(idNum) && idNum !== 0) platformIdSet.add(idNum);
    });
  }

  const count = 20;
  const size = 6;
  const minNum = ((page - 1) % size) * count + 1;
  const maxNum = ((page - 1) % size) * count + count;
  const traktPage = Math.floor((page - 1) / size) + 1;

  const url = `https://trakt.tv/users/${userName}/watchlist?page=${traktPage}`;
  const traktUrls = await fetchTraktUrlsByAdvancedFilter(
    url,
    {},
    minNum,
    maxNum,
    startYear,
    endYear,
    mediaType,
    platformIdSet
  );
  return await fetchImdbIdsFromTraktUrls(traktUrls);
}

async function fetchTraktUrlsByAdvancedFilter(
  url,
  headers = {},
  minNum,
  maxNum,
  startYear,
  endYear,
  mediaType = "",
  platformIdSet = new Set()
) {
  try {
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Cache-Control": "no-cache",
        ...headers,
      },
    });

    const docId = Widget.dom.parse(response.data);
    const metaElements = Widget.dom.select(docId, 'meta[content^="https://trakt.tv/"]');
    const allUrls = Array.from(
      new Set(metaElements.map((el) => Widget.dom.attr(el, "content")).filter(Boolean))
    ).slice(minNum - 1, maxNum);

    const filteredUrls = [];

    for (const url of allUrls) {
      try {
        const detail = await Widget.http.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const detailDoc = Widget.dom.parse(detail.data);

        // 年份过滤
        const yearEl = Widget.dom.select(detailDoc, 'span[class^="year"], span[class*="year"]')[0];
        const yearText = yearEl ? Widget.dom.text(yearEl).trim() : "";
        const itemYear = parseInt(yearText, 10);
        if (isNaN(itemYear) || itemYear < startYear || itemYear > endYear) continue;

        // 类型过滤
        const typeMeta = Widget.dom.select(detailDoc, 'meta[property="og:type"]')[0];
        const typeContent = typeMeta ? Widget.dom.attr(typeMeta, "content") || "" : "";
        if (mediaType && !typeContent.includes(mediaType)) continue;

        // IMDb ID 提取
        const imdbLinkEl = Widget.dom.select(detailDoc, "a#external-link-imdb")[0];
        const imdbHref = imdbLinkEl ? Widget.dom.attr(imdbLinkEl, "href") : "";
        const imdbMatch = imdbHref.match(/tt\d+/);
        const imdbId = imdbMatch ? imdbMatch[0] : null;
        if (!imdbId) continue;

        // 平台过滤
        if (platformIdSet.size > 0) {
          const tmdb = await forward.tmdb.fetchByImdb(imdbId);
          if (!tmdb) continue;
          const networks = (tmdb.networks || []).map((n) => n.id);
          if (!networks.some((id) => platformIdSet.has(id))) continue;
        }

        filteredUrls.push(url);
      } catch {
        // 忽略单条失败
        continue;
      }
    }

    return filteredUrls;
  } catch (error) {
    console.error("抓取失败:", error);
    return [];
  }
}

// forward.tmdb.fetchByImdb 基础版（无API Key，解析 TMDB 页面）
const forward = forward || {};
forward.tmdb = forward.tmdb || {};

forward.tmdb.fetchByImdb = async function (imdbId) {
  if (!imdbId || !imdbId.startsWith("tt")) {
    throw new Error("无效的 IMDb ID");
  }

  const url = `https://www.themoviedb.org/find/${imdbId}?language=en-US`;

  try {
    const res = await Widget.http.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const doc = Widget.dom.parse(res.data);

    let tmdbId = null;
    let tmdbType = null;

    const linkEls = Widget.dom.select(doc, 'a[href^="/movie/"], a[href^="/tv/"]');
    if (linkEls && linkEls.length > 0) {
      for (const el of linkEls) {
        const href = Widget.dom.attr(el, "href");
        if (!href) continue;
        const match = href.match(/\/(movie|tv)\/(\d+)/);
        if (match) {
          tmdbType = match[1];
          tmdbId = match[2];
          break;
        }
      }
    }

    if (!tmdbId) return null;

    const detailUrl = `https://www.themoviedb.org/${tmdbType}/${tmdbId}?language=en-US`;
    const detailRes = await Widget.http.get(detailUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const detailDoc = Widget.dom.parse(detailRes.data);

    const networkEls = Widget.dom.select(detailDoc, 'ul.production_companies > li > a, ul.networks > li > a');
    const networks = [];

    if (networkEls && networkEls.length > 0) {
      for (const el of networkEls) {
        const href = Widget.dom.attr(el, "href") || "";
        const idMatch = href.match(/\/network\/(\d+)/);
        const id = idMatch ? parseInt(idMatch[1]) : null;
        const name = Widget.dom.text(el).trim();
        if (id) {
          networks.push({ id, name });
        }
      }
    }

    return { id: tmdbId, type: tmdbType, networks };
  } catch (error) {
    console.error("forward.tmdb.fetchByImdb 失败:", error);
    return null;
  }
};
