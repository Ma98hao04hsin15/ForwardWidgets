WidgetMetadata = {
    id: "Letterboxd",
    title: "Letterboxd片單-奧斯卡",
    modules: [
        {
            id: "letterboxdList",
            title: "Letterboxd片单",
            requiresWebView: false,
            functionName: "loadListItems",
            cacheDuration: 86400,
            params: [
                {
                    name: "input_type",
                    title: "输入类型",
                    type: "enumeration",
                    value: "select",
                    enumOptions: [
                        {title: "筛选", value: "select"},
                        {title: "自定义", value: "customize"},
                    ],
                },
                {
                    name: "list_select",
                    title: "片单完整URL",
                    type: "enumeration",
                    description: "如：https://letterboxd.com/crew/list/2024-highest-rated-films/",
                    belongTo: {
                        paramName: "input_type",
                        value: ["select"],
                    },
                    enumOptions: [
                        {
                            title: "奧斯卡獲獎影片：最佳影片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-best-picture/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳男主角",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-actor-in-a-leading-role/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳女主角",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-actress-in-a-leading/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳男配角",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-actor-in-a-supporting/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳女配角",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-actress-in-a-supporting/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳導演",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-director/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳電影剪輯",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-film-editing/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳攝影",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-cinematography/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳原創劇本",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-original-screenplay/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳改編劇本",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-adapted-screenplay/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳製作設計",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-production-design/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳服裝設計",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-costume-design/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳化妝和髮型設計",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-makeup-and-hairstyling/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳視覺效果",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-visual-effects/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳聲音",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-sound/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳原創配樂",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-original-score/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳原創歌曲",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-original-song/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳動畫短片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-animated-short/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳真人短片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-live-action-short/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳國際長片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-international-feature/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳紀錄片長片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-documentary-feature/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳紀錄片短片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-documentary-short/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳動畫長片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-animated-feature/"
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                        {
                            title: "奧斯卡獲獎影片：最佳",
                            value: ""
                        },
                    ],
                },
                {
                    name: "url_customize",
                    title: "自定义片单",
                    type: "input",
                    belongTo: {
                        paramName: "input_type",
                        value: ["customize"],
                    },
                    description: "自定义片单，如：https://letterboxd.com/crew/list/2024-highest-rated-films/",
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page"
                },
            ],
        },
    ],
    version: "1.0.0",
    requiredVersion: "0.0.1",
    description: "解析Letterboxd片单内的影片【五折码：CHEAP.5;七折码：CHEAP】",
    author: "huangxd",
    site: "https://github.com/huangxd-/ForwardWidgets"
};

function extractLetterboxdUrlsFromResponse(responseData, minNum, maxNum) {
    // 创建Cheerio实例解析HTML
    let $ = Widget.html.load(responseData);

    // 定位所有包含data-target-link属性的影片容器div
    // 选择器匹配：li.poster-container 下的 div.film-poster（包含data-target-link属性）
    let filmContainers = $('li.poster-container div.film-poster[data-target-link]');

    if (!filmContainers.length) {
        throw new Error("未找到包含data-target-link属性的电影容器");
    }

    // 提取并去重URL（从data-target-link属性获取，拼接完整域名）
    let letterboxdUrls = Array.from(new Set(
        filmContainers
            .map((i, el) => {
                // 获取data-target-link属性值（影片相对路径）
                const targetLink = $(el).data('target-link') || $(el).attr('data-target-link');
                // 过滤无效链接（确保路径以/film/开头，符合Letterboxd影片页规则）
                if (!targetLink || !targetLink.startsWith('/film/')) {
                    console.warn(`无效的影片链接属性值：${targetLink}`);
                    return null;
                }
                return `https://letterboxd.com${targetLink}`;
            })
            .get()
            .filter(Boolean) // 移除null值
    ));

    // 处理边界情况，确保索引在有效范围内
    const start = Math.max(0, minNum - 1);
    const end = Math.min(maxNum, letterboxdUrls.length);
    return letterboxdUrls.slice(start, end);
}

async function fetchImdbIdsFromLetterboxdUrls(letterboxdUrls) {
    let imdbIdPromises = letterboxdUrls.map(async (url) => {
        try {
            let detailResponse = await Widget.http.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            });

            // 使用 Widget.html.load 解析详情页
            let $ = Widget.html.load(detailResponse.data);
            let imdbLinkEl = $('a[data-track-action="IMDb"]').first();

            if (!imdbLinkEl.length) return null;

            let href = imdbLinkEl.attr('href');
            let match = href.match(/title\/(tt\d+)/);

            return match ? `${match[1]}` : null;
        } catch {
            return null; // 忽略单个失败请求
        }
    });

    let imdbIds = [...new Set(
        (await Promise.all(imdbIdPromises))
            .filter(Boolean)
            .map((item) => item)
    )].map((id) => ({
        id,
        type: "imdb",
    }));
    console.log("请求imdbIds:", imdbIds);
    return imdbIds;
}

async function fetchLetterboxdData(url, headers = {}, minNum, maxNum) {
    try {
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                ...headers,
            },
        });

        console.log("请求结果:", response.data);

        let letterboxdUrls = extractLetterboxdUrlsFromResponse(response.data, minNum, maxNum);

        return await fetchImdbIdsFromLetterboxdUrls(letterboxdUrls);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

async function loadListItems(params = {}) {
    try {
        const page = params.page;
        const inputType = params.input_type || "";
        const listSelect = params.list_select || "";
        const urlCustomize = params.url_customize || "";
        const sortBy = params.sort_by || "default";
        const genre = params.genre || "default";
        const decade = params.decade || "default";
        const count = 20;
        const minNum = ((page - 1) % 5) * count + 1;
        const maxNum = ((page - 1) % 5) * count + 20;
        const letterboxdPage = Math.floor((page - 1) / 5) + 1;

        let listUrl;
        if (inputType === "select") {
            listUrl = listSelect
        } else {
            listUrl = urlCustomize
        }

        if (!listUrl) {
            throw new Error("必须提供 Letterboxd 片单完整URL");
        }

        // 确保 URL 以斜杠结尾，然后附加页面和排序参数
        let baseUrl = listUrl.endsWith('/') ? listUrl : `${listUrl}/`;
        let url = `${baseUrl}page/${letterboxdPage}/`;
        if (decade !== "default") {
            url += `decade/${decade}/`;
        }
        if (genre !== "default") {
            url += `genre/${genre}/`;
        }
        if (sortBy !== "default") {
            url += `by/${sortBy}/`;
        }

        return await fetchLetterboxdData(url, {}, minNum, maxNum);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}
