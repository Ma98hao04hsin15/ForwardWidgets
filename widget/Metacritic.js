var WidgetMetadata = {
    id: "MetacriticMovie",
    title: "Metacritic 电影榜单",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    description: "从 Metacritic 获取电影榜单数据，支持当前年度、新上映、热门等类型页面",
    author: "huangxd",
    site: "https://www.metacritic.com/browse/movie/",
    params: [
        {
            name: "url",
            title: "Metacritic 浏览页链接",
            type: "string",
            default: "https://www.metacritic.com/browse/movie/all/all/current-year/",
            required: true
        }
    ],
    modules: [
        {
            title: "电影榜单",
            functionName: "loadMetacriticMovies",
            cacheDuration: 1800,
            params: []
        }
    ]
};

async function loadMetacriticMovies(params, ctx) {
    const url = params.url;
    const headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9"
    };

    const html = await $http.get(url, { headers }).then(res => res.data);
    const dom = $cheerio.load(html);

    const items = [];
    dom(".clamp-summary-wrap").each((i, el) => {
        const title = dom(el).find("h3").text().trim();
        const year = dom(el).find(".clamp-details span").first().text().trim();
        const genre = dom(el).find(".clamp-details span").last().text().trim();
        const rating = dom(el).find(".metascore_w").first().text().trim();
        const link = "https://www.metacritic.com" + dom(el).find("a.title").attr("href");
        const image = dom(el).prev("img").attr("src") || "";

        items.push({
            title: title,
            description: `${year} · ${genre} · 评分 ${rating}`,
            image: image,
            url: link
        });
    });

    return items;
}
