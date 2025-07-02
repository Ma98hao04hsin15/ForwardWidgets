// === IMDb Watchlist ForwardWidget 模块定义 ===
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
                    description: "请输入IMDb用户ID，如 ur204635540",
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
    description: "解析IMDb用户Watchlist网页，获取影片IMDb ID列表",
    author: "chatgpt",
    site: ""
};

// === 解析函数 ===
function extractImdbIdsFromWatchlistHtml(html) {
    const doc = Widget.dom.parse(html);

    // 1. 尝试从 ld+json 脚本里提取
    const scripts = Widget.dom.select(doc, 'script[type="application/ld+json"]');
    for (const script of scripts) {
        try {
            const jsonText = script.textContent || script.innerText || Widget.dom.text(script);
            const jsonData = JSON.parse(jsonText);
            if (jsonData && jsonData.itemListElement) {
                const ids = jsonData.itemListElement.map(item => {
                    if (item.url) {
                        const m = item.url.match(/title\/(tt\d+)/);
                        return m ? m[1] : null;
                    }
                    return null;
                }).filter(Boolean);
                if (ids.length > 0) return [...new Set(ids)];
            }
        } catch (e) {
            // 忽略 JSON 解析异常
        }
    }

    // 2. 尝试常规 DOM 查询方式
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
    if (imdbIds.length > 0) return [...new Set(imdbIds)];

    // 3. 兜底，全文正则匹配
    const reg = /\/title\/(tt\d{7,8})/g;
    let match;
    const ids = [];
    while ((match = reg.exec(html)) !== null) {
        ids.push(match[1]);
    }
    return [...new Set(ids)];
}

// === 主函数：加载IMDb Watchlist ===
async function loadImdbWatchlistItems(params = {}) {
    try {
        const userId = params.user_id || "";
        const page = params.page || 1;
        if (!userId) {
            throw new Error("必须提供IMDb用户ID");
        }
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
