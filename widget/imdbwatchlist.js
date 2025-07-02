// IMDb Watchlist Widget
WidgetMetadata = {
    id: "imdb.watchlist",
    title: "IMDb 用户 Watchlist",
    modules: [
        {
            title: "IMDb Watchlist",
            requiresWebView: false,
            functionName: "loadImdbWatchlistItems",
            cacheDuration: 3600,
            params: [
                {
                    name: "user_id",
                    title: "IMDb 用户ID",
                    type: "input",
                    description: "请输入IMDb用户ID，如 ur123456789",
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                },
            ],
        },
    ],
    version: "1.0.0",
    requiredVersion: "0.0.1",
    description: "通过解析IMDb用户Watchlist网页，获取影片IMDb ID列表",
    author: "yourname",
    site: "https://github.com/yourrepo"
};

/**
 * 解析 IMDb Watchlist HTML 页面，提取 IMDb ID
 * @param {string} html 页面源码
 * @returns {string[]} IMDb ID数组
 */
function extractImdbIdsFromWatchlistHtml(html) {
    const doc = Widget.dom.parse(html);
    // IMDb Watchlist 里的每个影片条目一般在 div.lister-item-header > a[href^="/title/tt"]
    const linkElements = Widget.dom.select(doc, 'div.lister-item-header a[href^="/title/tt"]');
    const imdbIds = [];
    linkElements.forEach(el => {
        const href = Widget.dom.attr(el, 'href');
        if (href) {
            const match = href.match(/\/title\/(tt\d+)/);
            if (match) {
                imdbIds.push(match[1]);
            }
        }
    });
    return [...new Set(imdbIds)]; // 去重
}

/**
 * 加载IMDb Watchlist数据
 * @param {object} params 参数对象，包含 user_id 和 page
 * @returns {Promise<object[]>} 返回 IMDb ID数组，格式：[{id:"ttxxxxxx", type:"imdb"}, ...]
 */
async function loadImdbWatchlistItems(params = {}) {
    try {
        const userId = params.user_id || "";
        const page = params.page || 1;
        if (!userId) {
            throw new Error("必须提供IMDb用户ID");
        }
        // IMDb Watchlist分页，每页100条，page从1开始
        // Watchlist URL格式：https://www.imdb.com/user/{userId}/watchlist?sort=rank&mode=detail&page=1
        const url = `https://www.imdb.com/user/${userId}/watchlist?sort=rank&mode=detail&page=${page}`;

        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
            },
        });

        const imdbIds = extractImdbIdsFromWatchlistHtml(response.data);

        return imdbIds.map(id => ({ id, type: "imdb" }));
    } catch (error) {
        console.error("IMDb Watchlist 解析失败:", error);
        throw error;
    }
}
