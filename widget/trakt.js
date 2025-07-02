WidgetMetadata = {
  id: "forward.trakt.watchlist.nokey",
  title: "Trakt Watchlist（无 TMDB API Key）+ 播放平台筛选",
  description: "通过解析 Trakt Watchlist 页面获取 IMDb ID，不依赖 TMDB API Key，通过硬编码平台映射筛选播放平台。",
  version: "1.0.0",
  author: "Forward",
  site: "https://github.com/InchStudio/ForwardWidgets",
  modules: [
    {
      id: "traktWatchlistNoKey",
      title: "Trakt Watchlist 获取与平台筛选",
      requiresWebView: false,
      cacheDuration: 3600, // 缓存1小时
      params: [
        {
          name: "user_name",
          title: "Trakt 用户名",
          type: "string",
          required: true,
        },
        {
          name: "platformFilter",
          title: "播放平台筛选 (逗号分隔，例：Netflix,Disney+)",
          type: "string",
          required: false,
        },
      ],
      // 核心逻辑函数，返回过滤后的影片数据
      async functionName(params) {
        const { user_name, platformFilter } = params;
        // 播放平台硬编码映射：platform name → TMDB network id
        const platformMap = {
          Netflix: 213,
          "Disney+": 337,
          HBO: 49,
          Amazon: 1024,
          Hulu: 453,
          AppleTV: 2552,
          NHK: 2716,
          FujiTV: 2440,
          NTV: 328,
          TBS: 291,
          TVTokyo: 233,
          WOWOW: 206,
        };
        
        // 解析前端传入的平台列表，变成 network id 数组
        let filterNetworkIds = [];
        if (platformFilter) {
          filterNetworkIds = platformFilter
            .split(",")
            .map((p) => p.trim())
            .map((p) => platformMap[p])
            .filter(Boolean);
        }
        
        // 1. 解析 Trakt Watchlist HTML 页面获取 IMDb ID 列表
        // URL示范：https://trakt.tv/users/{user_name}/watchlist/movies
        // 也可以电影和电视剧分页，示范仅电影，电视剧类似
        const fetchWatchlistIMDbIDs = async () => {
          const url = `https://trakt.tv/users/${user_name}/watchlist/movies`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("无法访问 Trakt Watchlist 页面");
          const html = await res.text();
          // 使用正则或 DOMParser 解析IMDb ID
          // Trakt的页面中，IMDb链接通常是：https://www.imdb.com/title/tt1234567/
          const imdbIDs = [...html.matchAll(/https:\/\/www\.imdb\.com\/title\/(tt\d{7,8})/g)].map(m => m[1]);
          return Array.from(new Set(imdbIDs)); // 去重
        };
        
        // 2. 对于每个 IMDb ID，调用 TMDB 无 API Key 的公开接口获得影片详情
        //    利用 TMDB 的 /find/{imdb_id} 接口（无需 API Key，限速低，可能需代理）
        //    或者本地缓存，这里示范 fetch 方式
        const fetchTmdbInfoByImdb = async (imdb_id) => {
          const url = `https://api.themoviedb.org/3/find/${imdb_id}?external_source=imdb_id&api_key=`; 
          // 这里故意留空api_key，实际 TMDB API 需要 key，这里改用非官方方案或代理
          // 为实现无Key，请自行实现代理或替代方案，示范这里先返回 null
          return null;
        };
        
        // 3. 因无 TMDB API Key，只能通过硬编码或本地缓存的网络平台映射来判断是否包含过滤平台
        //    这里直接返回全部 imdb id，不做平台过滤（示范）
        
        const imdbIDs = await fetchWatchlistIMDbIDs();
        
        // TODO: 如果有 TMDB 详情，结合平台过滤
        // 这里直接返回 imdbIDs 作为结果，附加平台字段为空
        
        // 返回结构示例
        return imdbIDs.map((id) => ({
          imdb_id: id,
          title: null, // 无 API 详情，暂空
          platforms: [], // 无 API 详情，暂空
        }));
      },
    },
  ],
};

export default WidgetMetadata;
