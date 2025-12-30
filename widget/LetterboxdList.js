/**
 * Letterboxd 片單解析模塊
 * 適用於特定 List (例如 Top 250)
 */

var WidgetMetadata = {
    id: "letterboxd_list_viewer",
    title: "Letterboxd 片單助手",
    description: "解析並顯示 Letterboxd 上的任意公開片單",
    author: "Gemini",
    version: "0.0.1",
    requiredVersion: "0.0.1",
    detailCacheDuration: 3600,
    modules: [
        {
            title: "片單內容",
            description: "輸入片單網址進行解析",
            requiresWebView: false,
            functionName: "getLetterboxdListData",
            params: [
                {
                    name: "listUrl",
                    title: "片單網址",
                    type: "input",
                    description: "請輸入完整的片單 URL",
                    value: "https://letterboxd.com/dave/list/official-top-250-narrative-feature-films/"
                },
                {
                    name: "page",
                    title: "頁碼",
                    type: "page",
                    description: "自動分頁處理",
                    value: "1"
                }
            ]
        }
    ]
};

async function getLetterboxdListData(params) {
    let { listUrl, page } = params;
    
    // 1. 規範化 URL 格式
    if (!listUrl) return [];
    let baseUrl = listUrl.endsWith('/') ? listUrl : listUrl + '/';
    
    // 處理分頁，如果 page > 1 則加上 page/x/
    let finalUrl = page > 1 ? `${baseUrl}page/${page}/` : baseUrl;

    try {
        const response = await $http.get({
            url: finalUrl,
            header: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
            }
        });

        const html = response.data;

        // 2. 定位片單容器 (ul.poster-list)
        const listMatch = html.match(/<ul class="poster-list[\s\S]*?<\/ul>/);
        if (!listMatch) {
            console.log("未找到片單內容，請檢查網址是否正確");
            return [];
        }

        const listContent = listMatch[0];
        
        // 3. 提取電影信息
        // 匹配 data-film-slug (連結用), src (圖片用), alt (標題用)
        const movieRegex = /<li[\s\S]*?data-film-slug="([^"]+)"[\s\S]*?src="([^"]+)"[\s\S]*?alt="([^"]+)"/g;
        let movies = [];
        let match;

        while ((match = movieRegex.exec(listContent)) !== null) {
            let slug = match[1];
            let rawImg = match[2];
            let title = match[3];

            // 4. 圖片處理：將縮圖替換為較清晰的版本 (230x345)
            let highResImg = rawImg.replace(/-(0-150-0-225|0-70-0-105)-/, "-0-230-0-345-");
            
            // 如果圖片是 lazyload 的 placeholder，則嘗試抓取 data-src
            if (rawImg.includes('empty-poster')) {
                const dataSrcMatch = match[0].match(/data-src="([^"]+)"/);
                if (dataSrcMatch) {
                    highResImg = dataSrcMatch[1].replace(/-(0-150-0-225|0-70-0-105)-/, "-0-230-0-345-");
                }
            }

            movies.push({
                title: title,
                image: highResImg,
                link: `https://letterboxd.com/film/${slug}/`,
                description: `Letterboxd ID: ${slug}`
            });
        }

        return movies;

    } catch (error) {
        console.log("解析出錯: " + error);
        return [];
    }
}
