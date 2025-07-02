// ✅ 完整整合版 Trakt Widget 模块，支持播放平台过滤（IMDb → TMDB）

WidgetMetadata = {
    id: "Trakt",
    title: "Trakt我看&Trakt个性化推荐",
    version: "1.0.12",
    requiredVersion: "0.0.1",
    description: "解析Trakt数据并支持播放平台筛选功能（无需 API Key）",
    author: "huangxd + GPT",
    site: "https://github.com/huangxd-/ForwardWidgets",
    modules: [
        {
            title: "trakt我看",
            requiresWebView: false,
            functionName: "loadInterestItems",
            cacheDuration: 3600,
            params: [
                { name: "user_name", title: "用户名", type: "input" },
                { name: "status", title: "状态", type: "enumeration", enumOptions: [
                    { title: "想看", value: "watchlist" },
                    { title: "在看", value: "progress" },
                    { title: "看过-电影", value: "history/movies/added/asc" },
                    { title: "看过-电视", value: "history/shows/added/asc" },
                    { title: "随机想看", value: "random_watchlist" },
                ] },
                { name: "platform", title: "播放平台", type: "enumeration", enumOptions: [
                    { title: "不限", value: "" },
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
                ] },
                { name: "page", title: "页码", type: "page" },
            ],
        },
    ]
};

async function fetchPlatformFilteredTmdbData(imdbIds, platformFilter = "") {
    const results = [];
    for (const { id } of imdbIds) {
        try {
            const url = `https://www.themoviedb.org/find/${id}`;
            const response = await Widget.http.get(url);
            const doc = Widget.dom.parse(response.data);
            const detailLink = Widget.dom.select(doc, 'a.result')[0];
            if (!detailLink) continue;
            const tmdbHref = Widget.dom.attr(detailLink, 'href');
            const tmdbUrl = `https://www.themoviedb.org${tmdbHref}`;
            const detailRes = await Widget.http.get(tmdbUrl);
            const detailDoc = Widget.dom.parse(detailRes.data);
            const networks = Widget.dom.select(detailDoc, 'ol.networks li img');
            const platformNames = networks.map(n => Widget.dom.attr(n, 'alt')?.trim()).filter(Boolean);
            if (!platformFilter || platformNames.includes(platformFilter)) {
                results.push({ id, type: "imdb", platforms: platformNames });
            }
        } catch { continue; }
    }
    return results;
}

async function fetchTraktData(url, headers = {}, status, minNum, maxNum, random = false, order = "", platform = "") {
    const response = await Widget.http.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Cache-Control": "no-cache",
            ...headers,
        }
    });
    let traktUrls = (status === "progress")
        ? extractTraktUrlsInProgress(response.data, minNum, maxNum)
        : extractTraktUrlsFromResponse(response.data, minNum, maxNum, random);
    if (order === "desc") traktUrls.reverse();
    const imdbIds = await fetchImdbIdsFromTraktUrls(traktUrls);
    return platform ? await fetchPlatformFilteredTmdbData(imdbIds, platform) : imdbIds;
}

async function loadInterestItems(params = {}) {
    const { user_name, status, page, platform } = params;
    if (!user_name) throw new Error("必须提供 Trakt 用户名");
    const count = 20;
    const isRandom = status === "random_watchlist";
    const actualStatus = isRandom ? "watchlist" : status;
    const size = actualStatus === "watchlist" ? 6 : 3;
    const minNum = ((page - 1) % size) * count + 1;
    const maxNum = minNum + count - 1;
    const traktPage = Math.floor((page - 1) / size) + 1;
    if (isRandom && page > 1) return [];
    const url = `https://trakt.tv/users/${user_name}/${actualStatus}?page=${traktPage}`;
    return await fetchTraktData(url, {}, actualStatus, minNum, maxNum, isRandom, "", platform);
}

// extractTraktUrlsFromResponse, extractTraktUrlsInProgress, fetchImdbIdsFromTraktUrls 等辅助函数保持不变即可复用。
