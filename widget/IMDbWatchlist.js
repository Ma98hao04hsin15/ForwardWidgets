var WidgetMetadata = {
    id: "IMDbWatchlist",
    title: "IMDb Watchlist",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    description: "抓取公开的IMDb Watchlist内容并转换为IMDb ID，可分页或随机抽取展示。",
    author: "huangxd",
    site: "https://github.com/huangxd-/ForwardWidgets",
    modules: [
        {
            title: "IMDb Watchlist",
            requiresWebView: false,
            functionName: "loadIMDbWatchlistItems",
            cacheDuration: 3600,
            params: [
                {
                    name: "watchlist_url",
                    title: "IMDb Watchlist 链接",
                    type: "input",
                    description: "如：https://www.imdb.com/user/urXXXX/watchlist/?ref_=hm_nv_urwls_all，必须为公开列表",
                },
                {
                    name: "mode",
                    title: "加载模式",
                    type: "enumeration",
                    enumOptions: [
                        {
                            title: "分页加载",
                            value: "page",
                        },
                        {
                            title: "随机抽取9个影片",
                            value: "random",
                        },
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                },
            ],
        }
    ]
};
async function loadIMDbWatchlistItems(params = {}) {
    try {
        const url = params.watchlist_url;
        const mode = params.mode || "page";
        const page = params.page || 1;

        if (!url || !url.includes("/watchlist")) {
            throw new Error("请输入有效的 IMDb Watchlist 链接");
        }

        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const match = response.data.match(/"itemListElement":(\[.*?\]),\n/);
        if (!match) {
            throw new Error("无法找到 watchlist 数据，可能是列表未公开或 IMDb 页面结构已更改");
        }

        const items = JSON.parse(match[1]);
        const imdbIds = items
            .map(item => item?.item?.['@id']?.match(/title\/(tt\d+)/)?.[1])
            .filter(Boolean);

        let resultIds;
        if (mode === "random") {
            if (page > 1) return [];
            const shuffled = imdbIds.sort(() => 0.5 - Math.random());
            resultIds = shuffled.slice(0, 9);
        } else {
            const count = 20;
            const start = (page - 1) * count;
            resultIds = imdbIds.slice(start, start + count);
        }

        return resultIds.map(id => ({
            id,
            type: "imdb"
        }));
    } catch (error) {
        console.error("IMDb Watchlist 加载失败:", error);
        throw error;
    }
}
