/* TMDB X 單日榜單 - ForwardWidget */
WidgetMetadata = {
  id: "forward.tmdb.trending-daily",
  title: "TMDB X 單日榜單",
  version: "1.8.6",
  requiredVersion: "0.0.1",
  description: "TMDB 單日熱門、高分、熱映、即將上映、最近上映、類型、串流平台、電影出品公司、地區劇集及北美日票房榜單。This product uses the TMDB API but is not endorsed or certified by TMDB.",
  author: "Custom ForwardWidget",
  site: "https://www.themoviedb.org/",
  detailCacheDuration: 3600,
  modules: [
    {
      id: "trendingWeek", title: "單日熱門", description: "TMDB 今日熱門電影／劇集", functionName: "trendingWeek",
      cacheDuration: 3600,
      params: [
        { name: "mediaType", title: "內容類型", type: "enumeration", value: "all", enumOptions: mediaTypes() },
        { name: "language", title: "語言", type: "input", value: "zh-TW" },
        { name: "page", title: "頁碼", type: "page", value: "1" },
        { name: "count", title: "顯示數量", type: "count", value: "20" }
      ]
    },
    {
      id: "topRatedWeek", title: "單日高分", description: "從 TMDB 今日熱門內容中按評分排列", functionName: "topRatedWeek",
      cacheDuration: 3600,
      params: [
        { name: "mediaType", title: "內容類型", type: "enumeration", value: "all", enumOptions: mediaTypes() },
        { name: "language", title: "語言", type: "input", value: "zh-TW" },
        { name: "count", title: "顯示數量", type: "count", value: "20" }
      ]
    },
    {
      id: "nowPlayingWeek", title: "單日熱映", description: "正在上映的電影與今日播出的劇集", functionName: "nowPlayingWeek",
      cacheDuration: 3600,
      params: [
        { name: "mediaType", title: "內容類型", type: "enumeration", value: "all", enumOptions: mediaTypes() },
        { name: "language", title: "語言", type: "input", value: "zh-TW" },
        { name: "count", title: "顯示數量", type: "count", value: "20" }
      ]
    },
    {
      id: "upcomingPremieres",
      title: "即將上映",
      description: "今明兩天（未來 1 天）院線上映或數位首映的電影",
      requiresWebView: false,
      functionName: "loadUpcomingPremieres",
      cacheDuration: 21600,
      params: [
        {
          name: "releaseType",
          title: "發行類型",
          type: "enumeration",
          value: "2|3|4",
          enumOptions: [
            { title: "院線＋數位", value: "2|3|4" },
            { title: "僅院線", value: "2|3" },
            { title: "僅數位首映", value: "4" }
          ]
        },
        {
          name: "region",
          title: "發行地區",
          type: "enumeration",
          value: "US",
          enumOptions: [
            { title: "美國", value: "US" },
            { title: "英國", value: "GB" },
            { title: "台灣", value: "TW" },
            { title: "香港", value: "HK" },
            { title: "日本", value: "JP" },
            { title: "韓國", value: "KR" }
          ]
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          value: "popularity",
          enumOptions: [
            { title: "熱門程度", value: "popularity" },
            { title: "上映日期（近→遠）", value: "date.asc" },
            { title: "評分最高", value: "vote_average.desc" },
            { title: "最多人看（評分人數）", value: "vote_count.desc" }
          ]
        },
        {
          name: "language",
          title: "TMDB 語言",
          type: "enumeration",
          value: "zh-TW",
          enumOptions: [
            { title: "繁體中文", value: "zh-TW" },
            { title: "简体中文", value: "zh-CN" },
            { title: "English", value: "en-US" }
          ]
        }
      ]
    },
    {
      id: "recentPremieres",
      title: "最近上映",
      description: "過去 1 天（昨天）院線上映或數位首映的電影",
      requiresWebView: false,
      functionName: "loadRecentPremieres",
      cacheDuration: 21600,
      params: [
        {
          name: "releaseType",
          title: "發行類型",
          type: "enumeration",
          value: "2|3|4",
          enumOptions: [
            { title: "院線＋數位", value: "2|3|4" },
            { title: "僅院線", value: "2|3" },
            { title: "僅數位首映", value: "4" }
          ]
        },
        {
          name: "region",
          title: "發行地區",
          type: "enumeration",
          value: "US",
          enumOptions: [
            { title: "美國", value: "US" },
            { title: "英國", value: "GB" },
            { title: "台灣", value: "TW" },
            { title: "香港", value: "HK" },
            { title: "日本", value: "JP" },
            { title: "韓國", value: "KR" }
          ]
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          value: "popularity",
          enumOptions: [
            { title: "熱門程度", value: "popularity" },
            { title: "上映日期（新→舊）", value: "date.desc" },
            { title: "評分最高", value: "vote_average.desc" },
            { title: "最多人看（評分人數）", value: "vote_count.desc" }
          ]
        },
        {
          name: "language",
          title: "TMDB 語言",
          type: "enumeration",
          value: "zh-TW",
          enumOptions: [
            { title: "繁體中文", value: "zh-TW" },
            { title: "简体中文", value: "zh-CN" },
            { title: "English", value: "en-US" }
          ]
        }
      ]
    },
    {
      id: "genreWeek", title: "類型榜單", description: "依 TMDB 電影類型篩選單日熱門", functionName: "genreWeek",
      cacheDuration: 3600,
      params: [
        { name: "genreId", title: "電影類型", type: "enumeration", value: "28", enumOptions: genreOptions() },
        { name: "mediaType", title: "內容類型", type: "enumeration", value: "all", enumOptions: mediaTypes() },
        { name: "language", title: "語言", type: "input", value: "zh-TW" },
        { name: "count", title: "顯示數量", type: "count", value: "20" }
      ]
    },
    {
      id: "streamingWeek", title: "串流平台單日榜單", description: "Netflix、HBO Max、Hulu、Amazon Prime Video、Disney+、Apple TV+及其他平台榜單", functionName: "streamingWeek",
      cacheDuration: 3600,
      params: [
        { name: "providerId", title: "串流平台", type: "enumeration", value: "8", enumOptions: providerOptions() },
        { name: "chartType", title: "榜單類型", type: "enumeration", value: "popular", enumOptions: chartOptions() },
        { name: "genreId", title: "電影類型", type: "enumeration", value: "all", enumOptions: genreOptions() },
        { name: "mediaType", title: "內容類型", type: "enumeration", value: "all", enumOptions: mediaTypes() },
        { name: "region", title: "服務地區", type: "input", value: "TW" },
        { name: "language", title: "語言", type: "input", value: "zh-TW" },
        { name: "count", title: "顯示數量", type: "count", value: "20" }
      ]
    },
    {
      id: "companyMovies", title: "電影出品公司", description: "依 TMDB 電影出品公司篩選單日電影榜單", functionName: "companyMovies",
      cacheDuration: 3600,
      params: [
        { name: "companyId", title: "出品公司", type: "enumeration", value: "2", enumOptions: companyOptions() },
        { name: "chartType", title: "榜單類型", type: "enumeration", value: "popular", enumOptions: companyChartOptions() },
        { name: "language", title: "語言", type: "input", value: "zh-TW" },
        { name: "count", title: "顯示數量", type: "count", value: "20" }
      ]
    },
    {
      id: "regionalTvWeek", title: "單日地區劇集熱榜", description: "韓劇、歐美劇、日劇、陸劇、台劇今日熱門榜單", functionName: "regionalTvWeek",
      cacheDuration: 3600,
      params: [
        {
          name: "regionType",
          title: "劇集地區",
          type: "enumeration",
          value: "KR",
          enumOptions: [
            { title: "韓劇", value: "KR" },
            { title: "歐美劇", value: "US|GB|CA|AU|IE|NZ" },
            { title: "日劇", value: "JP" },
            { title: "陸劇", value: "CN" },
            { title: "台劇", value: "TW" }
          ]
        },
        { name: "language", title: "語言", type: "input", value: "zh-TW" },
        { name: "count", title: "顯示數量", type: "count", value: "20" }
      ]
    },
    {
      id: "todayTvPremieres", title: "今日即將上映劇集", description: "今天首播的新劇，或今天有播出集數的劇集", functionName: "todayTvPremieres",
      cacheDuration: 3600,
      params: [
        {
          name: "airType",
          title: "播出類型",
          type: "enumeration",
          value: "premiere",
          enumOptions: [
            { title: "新劇首播", value: "premiere" },
            { title: "今日播出（含續集）", value: "airing" }
          ]
        },
        {
          name: "regionType",
          title: "劇集地區",
          type: "enumeration",
          value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "韓劇", value: "KR" },
            { title: "歐美劇", value: "US|GB|CA|AU|IE|NZ" },
            { title: "日劇", value: "JP" },
            { title: "陸劇", value: "CN" },
            { title: "台劇", value: "TW" }
          ]
        },
        { name: "language", title: "語言", type: "input", value: "zh-TW" }
      ]
    },
    {
      id: "boxOfficeDaily", title: "北美日票房", description: "Box Office Mojo 單日票房排行", functionName: "loadDaily",
      cacheDuration: 3600,
      params: [
        { name: "date", title: "日期", type: "input", description: "YYYY-MM-DD，留空則取 2 天前", value: "" },
        { name: "limit", title: "顯示數量", type: "enumeration", value: "20", enumOptions: [{ title: "前 10", value: "10" }, { title: "前 20", value: "20" }, { title: "全部", value: "999" }] },
        { name: "language", title: "TMDB 語言", type: "enumeration", value: "zh-TW", enumOptions: [{ title: "繁體中文", value: "zh-TW" }, { title: "簡體中文", value: "zh-CN" }, { title: "English", value: "en-US" }] }
      ]
    }
  ]
};

var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var TMDB_API_KEY = "7d6f70d5503a84d6a3d3db3e6c4a3afe";

function mediaTypes() {
  return [{ title: "電影與劇集", value: "all" }, { title: "電影", value: "movie" }, { title: "劇集", value: "tv" }];
}
function chartOptions() {
  return [{ title: "熱門", value: "popular" }, { title: "高分", value: "topRated" }, { title: "今日上映／播出", value: "airing" }, { title: "類型榜單", value: "genre" }];
}
function companyChartOptions() {
  return [{ title: "熱門", value: "popular" }, { title: "高分", value: "topRated" }, { title: "今日上映", value: "airing" }];
}
function genreOptions() {
  return [
    { title: "全部", value: "all" }, { title: "動作 Action", value: "28" }, { title: "冒險 Adventure", value: "12" },
    { title: "動畫 Animation", value: "16" }, { title: "喜劇 Comedy", value: "35" }, { title: "犯罪 Crime", value: "80" },
    { title: "紀錄片 Documentary", value: "99" }, { title: "劇情 Drama", value: "18" }, { title: "家庭 Family", value: "10751" },
    { title: "奇幻 Fantasy", value: "14" }, { title: "歷史 History", value: "36" }, { title: "恐怖 Horror", value: "27" },
    { title: "音樂 Music", value: "10402" }, { title: "懸疑 Mystery", value: "9648" }, { title: "愛情 Romance", value: "10749" },
    { title: "科幻 Science Fiction", value: "878" }, { title: "電視電影 TV Movie", value: "10770" }, { title: "驚悚 Thriller", value: "53" },
    { title: "戰爭 War", value: "10752" }, { title: "西部 Western", value: "37" }
  ];
}
function providerOptions() {
  return [
    { title: "Netflix", value: "8" }, { title: "HBO Max／Max", value: "1899" }, { title: "Hulu", value: "15" },
    { title: "Amazon Prime Video", value: "9" }, { title: "Disney+", value: "337" }, { title: "Apple TV+", value: "350" },
    { title: "Peacock", value: "3353" }, { title: "Paramount+", value: "4330" }, { title: "AMC", value: "174" },
    { title: "CBS", value: "16" }, { title: "NBC", value: "6" }, { title: "ABC", value: "2" }, { title: "Starz", value: "318" },
    { title: "AMC+", value: "4661" }, { title: "BritBox", value: "4025" }, { title: "Tubi", value: "5187" }, { title: "The CW", value: "71" },
    { title: "Fox", value: "19" }, { title: "NHK", value: "2334" }, { title: "TBS", value: "160" }, { title: "NTV", value: "57" },
    { title: "Fuji TV", value: "1" }, { title: "TV Asahi", value: "103" }, { title: "TV Tokyo", value: "98" }, { title: "BS TV Tokyo", value: "3471" },
    { title: "WOWOW", value: "172" }, { title: "Kansai TV", value: "1163" }, { title: "U-NEXT", value: "3869" }, { title: "Paravi", value: "3879" },
    { title: "TELASA", value: "4809" }, { title: "FOD", value: "2763" }, { title: "dTV", value: "2137" }, { title: "tvN", value: "866" },
    { title: "SBS", value: "156" }, { title: "MBC", value: "97" }, { title: "KBS1", value: "829" }, { title: "KBS2", value: "342" },
    { title: "JTBC", value: "885" }, { title: "Coupang Play", value: "5169" }, { title: "Wavve", value: "3357" }, { title: "TVING", value: "3897" },
    { title: "OCN", value: "627" }, { title: "iQiyi", value: "1330" }, { title: "Tencent Video", value: "2007" }, { title: "Youku", value: "1419" },
    { title: "bilibili", value: "1605" }, { title: "Mango TV", value: "1631" }
  ];
}
function companyOptions() {
  return [
    { title: "迪士尼", value: "2" }, { title: "Pixar", value: "3" }, { title: "派拉蒙影業", value: "4" }, { title: "華納兄弟", value: "174" },
    { title: "哥倫比亞影業", value: "5" }, { title: "索尼影業", value: "34" }, { title: "環球影業", value: "33" }, { title: "二十世紀影業", value: "25" },
    { title: "Marvel", value: "420" }, { title: "DreamWorks Animation", value: "521" }, { title: "DreamWorks Pictures", value: "7" }, { title: "Lucasfilm Ltd.", value: "1" },
    { title: "Searchlight Pictures", value: "127929" }, { title: "New Line Cinema", value: "12" }, { title: "Warner Animation Group", value: "25120" }, { title: "Focus Features", value: "10146" },
    { title: "Sony Pictures Animation", value: "2251" }, { title: "Illumination", value: "6704" }, { title: "Blue Sky Studios", value: "9383" }, { title: "DC Studios", value: "184898" },
    { title: "Lionsgate", value: "1632" }, { title: "A24", value: "41077" }, { title: "華誼兄弟", value: "id:3393" }, { title: "中國電影集團", value: "id:2270" },
    { title: "China Film", value: "id:191908" }, { title: "China Film Creative", value: "id:221665" }, { title: "西部電影集團", value: "id:99069" },
    { title: "中影寰亞音像發行", value: "id:21348" }, { title: "China Wit Media", value: "id:140097" }, { title: "博納影業", value: "id:30148" },
    { title: "光線影業", value: "id:17818" }, { title: "萬達影業", value: "id:78952" }, { title: "Fun Age Pictures", value: "id:100127" },
    { title: "上海貓眼影業", value: "id:218024" }, { title: "貓眼娛樂", value: "id:96956" }, { title: "阿里影業", value: "id:69484" }, { title: "騰訊視頻", value: "id:74457" },
    { title: "邵氏兄弟", value: "id:5798" }, { title: "英皇電影", value: "id:122289" }, { title: "寰亞電影", value: "id:131586" }, { title: "Pegasus Motion Pictures", value: "id:6950" },
    { title: "八一電影製片廠", value: "id:39074" }, { title: "Shanghai Film Group", value: "id:3407" }, { title: "Shanghai Haimu Film Group", value: "id:230796" },
    { title: "上海電影集團 SFG", value: "id:48919" }, { title: "Beijing Film Studio", value: "id:708" },
    { title: "東寶 (Toho Pictures)", value: "id:49301" }, { title: "東寶映畫 (Toho Eiga)", value: "id:622" },
    { title: "東寶攝影所 (TOHO Studios)", value: "id:182161" }, { title: "東寶東和 (TOHO-TOWA)", value: "id:657" },
    { title: "吉卜力工作室 (Studio Ghibli)", value: "id:10342" }, { title: "松竹 (Shochiku)", value: "id:192" },
    { title: "Shochiku Studio", value: "id:130776" }, { title: "Shochiku Broadcasting", value: "id:81419" },
    { title: "角川 (Kadokawa)", value: "id:2073" }, { title: "角川書店 (Kadokawa Shoten)", value: "id:1194" },
    { title: "Kadokawa Daiei Studio", value: "id:46774" }, { title: "Nippon Herald Films", value: "id:1598" },
    { title: "日活 (Nikkatsu Corporation)", value: "id:955" }, { title: "Comix Wave Films", value: "id:3756" },
    { title: "Madhouse", value: "id:3464" }, { title: "京都動畫 (Kyoto Animation)", value: "id:5438" },
    { title: "Bandai Namco Filmworks", value: "id:173132" }, { title: "富士電視台 (Fuji Television Network)", value: "id:3341" },
    { title: "日本電視台 (Nippon Television Network Corporation)", value: "id:6755" }, { title: "BS Nippon Corporation", value: "id:192573" },
    { title: "TBS", value: "id:1393" }, { title: "BS-TBS", value: "id:121339" },
    { title: "朝日電視台 (TV Asahi)", value: "id:9300" }, { title: "Asahi Broadcasting Corporation", value: "id:4868" },
    { title: "東京電視台 (TV Tokyo)", value: "id:3034" }, { title: "BS TV Tokyo", value: "id:133425" },
    { title: "NHK", value: "id:15505" }, { title: "NHK Enterprises", value: "id:11376" },
    { title: "Altamira Pictures", value: "id:5099" }, { title: "電通 (Dentsu)", value: "id:1778" },
    { title: "Hakuhodo DY Music & Pictures", value: "id:142186" }, { title: "Hakuhodo DY Media Partners", value: "id:11846" },
    { title: "講談社 (Kodansha)", value: "id:59118" }, { title: "光文社 (Kobunsha)", value: "id:165495" },
    { title: "WOWOW", value: "id:157807" }, { title: "WOWOW Films", value: "id:5073" },
    { title: "Asmik Ace", value: "id:3033" }, { title: "Asmik Ace Entertainment", value: "id:194517" },
    { title: "GAGA Communications", value: "id:3656" }, { title: "GAGA Corporation", value: "id:84048" },
    { title: "CJ Entertainment", value: "id:7036" }, { title: "CJ ENM", value: "id:128404" },
    { title: "Showbox", value: "id:3491" }, { title: "Lotte Entertainment", value: "id:7819" },
    { title: "Next Entertainment World", value: "id:20064" }, { title: "Plus M Entertainment", value: "id:91505" },
    { title: "Barunson E&A", value: "id:4399" }, { title: "Little Big Pictures", value: "id:71853" },
    { title: "Hive Media Corp", value: "id:108532" }, { title: "Pinehouse Film", value: "id:6925" },
    { title: "Myung Films", value: "id:21415" }, { title: "Zip Cinema", value: "id:85150" },
    { title: "Opus Pictures", value: "id:7270" }, { title: "Chungeorahm Film", value: "id:79498" },
    { title: "Moonlight Film", value: "id:88974" }, { title: "BA Entertainment", value: "id:84678" },
    { title: "Sanai Pictures", value: "id:27133" }, { title: "TVING", value: "id:157262" }
  ];
}
function intValue(value, fallback, min, max) { var n = parseInt(value, 10); return isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function dateString(date) { return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0"); }
function weekRange() { var d = new Date(), day = d.getDay(), start = new Date(d); start.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); var end = new Date(start); end.setDate(start.getDate() + 6); return { start: dateString(start), end: dateString(end) }; }
function titleOf(item, type) { return type === "tv" ? (item.name || item.original_name || "未命名劇集") : (item.title || item.original_title || "未命名電影"); }
function makeItem(item) { var type = item.media_type === "tv" ? "tv" : "movie"; return { id: item.id, type: "tmdb", title: titleOf(item, type), originalTitle: type === "tv" ? item.original_name : item.original_title, description: item.overview || "", mediaType: type, releaseDate: type === "tv" ? (item.first_air_date || "") : (item.release_date || ""), rating: Number(item.vote_average || 0), voteCount: Number(item.vote_count || 0), popularity: Number(item.popularity || 0), posterPath: item.poster_path || "", backdropPath: item.backdrop_path || "" }; }
async function getJSON(url, params) { var r = await Widget.http.get(url, { headers: { Accept: "application/json" }, params: params }); if (!r || !r.data) throw new Error("TMDB 沒有回傳資料"); var d = typeof r.data === "string" ? JSON.parse(r.data) : r.data; if (d.status_code && d.status_message) throw new Error("TMDB API 錯誤：" + d.status_message); return d; }
async function trendingData(type, language, page, window) { return getJSON(TMDB_BASE_URL + "/trending/" + (type === "movie" || type === "tv" ? type : "all") + "/" + (window === "day" ? "day" : "week"), { api_key: TMDB_API_KEY, language: language, page: page }); }
async function trendingWeek(params) { params = params || {}; var type = params.mediaType === "movie" || params.mediaType === "tv" ? params.mediaType : "all", language = String(params.language || "zh-TW"), page = intValue(params.page, 1, 1, 100), count = intValue(params.count, 20, 1, 20), d = await trendingData(type, language, page, "day"); return (d.results || []).slice(0, count).map(makeItem); }
async function topRatedWeek(params) { params = params || {}; var type = params.mediaType === "movie" || params.mediaType === "tv" ? params.mediaType : "all", language = String(params.language || "zh-TW"), count = intValue(params.count, 20, 1, 20), all = []; for (var p = 1; p <= 5; p++) { var d = await trendingData(type, language, p, "day"); all = all.concat(d.results || []); } all.sort(function(a,b){ return Number(b.vote_average||0)-Number(a.vote_average||0) || Number(b.vote_count||0)-Number(a.vote_count||0); }); return all.slice(0,count).map(makeItem); }
async function nowPlayingWeek(params) { params = params || {}; var type = params.mediaType, language = String(params.language || "zh-TW"), count = intValue(params.count,20,1,20), out = []; if (!type || type === "all" || type === "movie") { var m = await getJSON(TMDB_BASE_URL + "/movie/now_playing", {api_key:TMDB_API_KEY, language:language, page:1}); (m.results||[]).forEach(function(x){x.media_type="movie";out.push(x);}); } if (!type || type === "all" || type === "tv") { var t = await getJSON(TMDB_BASE_URL + "/tv/airing_today", {api_key:TMDB_API_KEY, language:language, page:1}); (t.results||[]).forEach(function(x){x.media_type="tv";out.push(x);}); } out.sort(function(a,b){return Number(b.popularity||0)-Number(a.popularity||0);}); return out.slice(0,count).map(makeItem); }
async function genreWeek(params) { params = params || {}; var genre = String(params.genreId || "28"), type = params.mediaType === "movie" || params.mediaType === "tv" ? params.mediaType : "all", language = String(params.language || "zh-TW"), count = intValue(params.count,20,1,20), all=[]; for(var p=1;p<=5;p++){var d=await trendingData(type,language,p,"day"); all=all.concat(d.results||[]);} var seen={}; all=all.filter(function(x){var k=String(x.media_type)+":"+x.id;if(!x.id||!Array.isArray(x.genre_ids)||(genre!=="all"&&x.genre_ids.indexOf(Number(genre))<0)||seen[k])return false;seen[k]=1;return true;}); all.sort(function(a,b){return Number(b.popularity||0)-Number(a.popularity||0);}); return all.slice(0,count).map(makeItem); }
async function discover(type, opts) { var path = type === "tv" ? "/discover/tv" : "/discover/movie", q = {api_key:TMDB_API_KEY,language:opts.language,watch_region:opts.region,with_watch_providers:opts.provider,with_watch_monetization_types:"flatrate",page:1,include_adult:false,sort_by:opts.chart === "topRated" ? "vote_average.desc" : "popularity.desc"}; if(opts.chart === "topRated")q["vote_count.gte"]=100;if(opts.chart === "genre"&&opts.genre!=="all")q.with_genres=opts.genre;if(opts.chart === "airing"){var today=localDate(0);if(type === "tv"){q["air_date.gte"]=today;q["air_date.lte"]=today;}else{q["primary_release_date.gte"]=today;q["primary_release_date.lte"]=today;}}return getJSON(TMDB_BASE_URL+path,q); }
async function streamingWeek(params) { params=params||{};var provider=String(params.providerId||"8"),chart=["popular","topRated","airing","genre"].indexOf(params.chartType)>=0?params.chartType:"popular",type=params.mediaType==="movie"||params.mediaType==="tv"?params.mediaType:"all",opts={provider:provider,chart:chart,genre:String(params.genreId||"all"),region:String(params.region||"TW").toUpperCase(),language:String(params.language||"zh-TW")},count=intValue(params.count,20,1,20),types=type==="all"?["movie","tv"]:[type],out=[];for(var i=0;i<types.length;i++){var d=await discover(types[i],opts);(d.results||[]).forEach(function(x){x.media_type=types[i];out.push(x);});}out.sort(function(a,b){return chart==="topRated"?Number(b.vote_average||0)-Number(a.vote_average||0):Number(b.popularity||0)-Number(a.popularity||0);});return out.slice(0,count).map(makeItem);}
async function companyMovies(params) { params=params||{};var company=String(params.companyId||"2").replace(/^id:/i,""),chart=params.chartType==="topRated"||params.chartType==="airing"?params.chartType:"popular",language=String(params.language||"zh-TW"),count=intValue(params.count,20,1,20),q={api_key:TMDB_API_KEY,language:language,with_companies:company,page:1,include_adult:false,sort_by:chart==="topRated"?"vote_average.desc":"popularity.desc"};if(chart==="topRated")q["vote_count.gte"]=50;if(chart==="airing"){var today=localDate(0);q["primary_release_date.gte"]=today;q["primary_release_date.lte"]=today;}var d=await getJSON(TMDB_BASE_URL+"/discover/movie",q);return (d.results||[]).slice(0,count).map(function(x){x.media_type="movie";return makeItem(x);});}
async function regionalTvWeek(params) { params=params||{};var group=String(params.regionType||"KR"),language=String(params.language||"zh-TW"),count=intValue(params.count,20,1,20),countries=group.split("|"),all=[];for(var p=1;p<=5;p++){var d=await trendingData("tv",language,p,"day");all=all.concat(d.results||[]);}var seen={};all=all.filter(function(x){var key=String(x.id);if(!x.id||seen[key]||!Array.isArray(x.origin_country)||!countries.some(function(c){return x.origin_country.indexOf(c)>=0;}))return false;seen[key]=1;return true;});all.sort(function(a,b){return Number(b.popularity||0)-Number(a.popularity||0);});return all.slice(0,count).map(function(x){x.media_type="tv";return makeItem(x);});}
// ---------- 即將上映（對應 Simkl「Upcoming Theater and Digital Premieres」，範圍改為未來 1 天） ----------
const TZ_OFFSET_HOURS = 8; // 台北時間
const TYPE_LABEL = { 2: "限定院線", 3: "院線", 4: "數位" };

// 即將上映：今天起未來 1 天（今天＋明天）
async function loadUpcomingPremieres(params = {}) {
  return loadPremieresInRange(params, localDate(0), localDate(1));
}

// 最近上映：過去 1 天（昨天，不含今天）
async function loadRecentPremieres(params = {}) {
  return loadPremieresInRange(params, localDate(-1), localDate(-1));
}

async function loadPremieresInRange(params, from, to) {
  const language = params.language || "zh-TW";
  const region = params.region || "US";
  const releaseType = params.releaseType || "2|3|4";
  const wanted = releaseType.split("|").map(Number);

  const discoverParams = {
    sort_by: "popularity.desc",
    region,
    with_release_type: releaseType,
    "release_date.gte": from,
    "release_date.lte": to,
    include_adult: false,
    language
  };

  // 取熱門前 3 頁（約 60 部）
  const pages = await mapLimit([1, 2, 3], 3, async (page) => {
    const data = unwrap(await Widget.tmdb.get("/discover/movie", { params: { ...discoverParams, page } }), "results");
    return (data && data.results) || [];
  });

  const seen = {};
  const movies = [];
  pages.forEach((list) =>
    (list || []).forEach((d) => {
      if (seen[d.id]) return;
      seen[d.id] = true;
      movies.push(d);
    })
  );
  if (!movies.length) return [];

  // 查出該地區實際的院線／數位上映日期
  const releases = await mapLimit(movies, 8, (d) => findPremiere(d.id, region, wanted, from, to));

  let items = movies
    .map((d, idx) => ({ d, rel: releases[idx], idx }))
    .filter((x) => x.rel); // 只保留確認在期間內上映的電影

  const sort = params.sort || "popularity";
  if (sort === "date.asc") items.sort((a, b) => (a.rel.date > b.rel.date ? 1 : a.rel.date < b.rel.date ? -1 : a.idx - b.idx));
  else if (sort === "date.desc") items.sort((a, b) => (a.rel.date < b.rel.date ? 1 : a.rel.date > b.rel.date ? -1 : a.idx - b.idx));
  else if (sort === "vote_average.desc") items.sort((a, b) => (b.d.vote_average || 0) - (a.d.vote_average || 0));
  else if (sort === "vote_count.desc") items.sort((a, b) => (b.d.vote_count || 0) - (a.d.vote_count || 0));
  else items.sort((a, b) => a.idx - b.idx);

  return items.map(({ d, rel }) => ({
    id: d.id,
    type: "tmdb",
    mediaType: "movie",
    title: d.title,
    posterPath: d.poster_path,
    backdropPath: d.backdrop_path,
    releaseDate: rel.date,
    rating: d.vote_average ? Number(d.vote_average).toFixed(1) : undefined,
    genreTitle: `${rel.label} ${rel.date.slice(5).replace("-", "/")}`,
    description: `${rel.label}上映：${rel.date}\n${d.overview || ""}`
  }));
}

// 從 /movie/{id}/release_dates 找出期間內最早的院線／數位上映日期
async function findPremiere(id, region, wanted, from, to) {
  try {
    const data = unwrap(await Widget.tmdb.get(`/movie/${id}/release_dates`), "results");
    if (!data) return null;
    const country = data.results.find((r) => r.iso_3166_1 === region);
    if (!country) return null;

    const hits = (country.release_dates || [])
      .filter((r) => wanted.includes(r.type))
      .map((r) => ({ date: (r.release_date || "").slice(0, 10), type: r.type }))
      .filter((r) => r.date && r.date >= from && r.date <= to)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
    if (!hits.length) return null;

    // 同一天院線與數位同步時合併標示
    const first = hits[0];
    const sameDay = hits.filter((h) => h.date === first.date).map((h) => h.type);
    const theater = sameDay.includes(3) ? 3 : sameDay.includes(2) ? 2 : 0;
    const label = theater && sameDay.includes(4) ? TYPE_LABEL[theater] + "＋數位" : TYPE_LABEL[theater || first.type];
    return { date: first.date, label };
  } catch (e) {
    return null;
  }
}

// 依台北時間計算日期
function localDate(offsetDays) {
  const d = new Date(Date.now() + TZ_OFFSET_HOURS * 3600000 + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// 工具

function unwrap(res, field) {
  if (res && res[field] !== undefined) return res;
  if (res && res.data && res.data[field] !== undefined) return res.data;
  return null;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const cur = i++;
        try { out[cur] = await fn(items[cur], cur); } catch (e) { out[cur] = null; }
      }
    })
  );
  return out;
}

// ---------- 今日即將上映劇集 ----------
async function todayTvPremieres(params) {
  params = params || {};
  var airType = params.airType === "airing" ? "airing" : "premiere",
    group = String(params.regionType || "all"),
    language = String(params.language || "zh-TW"),
    today = localDate(0),
    q = { api_key: TMDB_API_KEY, language: language, include_adult: false, sort_by: "popularity.desc", timezone: "Asia/Taipei" };
  if (airType === "premiere") { q["first_air_date.gte"] = today; q["first_air_date.lte"] = today; }
  else { q["air_date.gte"] = today; q["air_date.lte"] = today; }
  if (group !== "all") q.with_origin_country = group;
  // 不限數量：抓完所有頁數（最多 50 頁防止過量請求）
  var maxPages = 50;
  var all = [], seen = {};
  for (var p = 1; p <= maxPages; p++) {
    q.page = p;
    var d = await getJSON(TMDB_BASE_URL + "/discover/tv", q);
    (d.results || []).forEach(function (x) { if (x.id && !seen[x.id]) { seen[x.id] = 1; all.push(x); } });
    if (!d.total_pages || p >= d.total_pages) break;
  }
  return all.map(function (x) {
    x.media_type = "tv";
    var item = makeItem(x);
    item.genreTitle = airType === "premiere" ? "首播 " + today.slice(5).replace("-", "/") : "今日播出";
    return item;
  });
}

// ---------- 北美日票房（Box Office Mojo） ----------
const BOM_BASE = "https://www.boxofficemojo.com";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

// ---------- 入口 ----------

async function loadDaily(params = {}) {
  const date = normalizeDate(params.date, 2);
  const url = `${BOM_BASE}/date/${date}/`;
  return loadChart(url, params, "day");
}

// ---------- 主流程 ----------

async function loadChart(url, params, mode) {
  const limit = parseInt(params.limit || "20", 10);
  const language = params.language || "zh-TW";

  const res = await Widget.http.get(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!res || !res.data) throw new Error("無法取得 Box Office Mojo 頁面");

  const rows = parseTable(res.data).slice(0, limit);
  if (rows.length === 0) throw new Error("該日期沒有票房資料，請換一個日期");

  const items = await Promise.all(
    rows.map((row) => toItem(row, language, mode).catch(() => fallbackItem(row, mode)))
  );
  return items.filter(Boolean);
}

// 純字串解析（不依賴 cheerio API，相容 Forward 的 HTML 解析器）
// 依表頭名稱定位欄位，避免欄位順序變動時解析錯位
function parseTable(html) {
  const tables = String(html).match(/<table\b[\s\S]*?<\/table>/gi) || [];
  const table = tables.find((t) => t.indexOf("/release/") !== -1);
  if (!table) return [];

  const rows = table.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
  const cellsOf = (tr) => {
    const cells = [];
    const re = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = re.exec(tr)) !== null) cells.push({ tag: m[1].toLowerCase(), html: m[2] });
    return cells;
  };

  const headerRow = rows.find((tr) => /<th\b/i.test(tr));
  const headers = headerRow ? cellsOf(headerRow).map((c) => cleanText(c.html).toLowerCase()) : [];
  const col = (...names) => headers.findIndex((h) => names.some((n) => h === n || h.startsWith(n)));

  const idx = {
    rank: col("rank"),
    release: col("release"),
    gross: col("gross", "daily"),
    total: col("total gross", "to date"),
    theaters: col("theaters"),
    span: col("weeks", "days"),
    distributor: col("distributor")
  };

  const out = [];
  rows.forEach((tr) => {
    const tds = cellsOf(tr).filter((c) => c.tag === "td");
    if (!tds.length) return;
    const cell = (i) => (i >= 0 && i < tds.length ? cleanText(tds[i].html) : "");

    const link = tr.match(/<a\b[^>]*href="([^"]*\/release\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!link) return;
    const href = link[1].replace(/&amp;/g, "&");
    const title = cleanText(link[2]);
    if (!title) return;
    const relId = (href.match(/\/release\/(rl\d+)/) || [])[1] || title;

    out.push({
      rank: cell(idx.rank) || String(out.length + 1),
      title,
      releaseUrl: (href.indexOf("http") === 0 ? "" : BOM_BASE) + href.split("?")[0],
      releaseId: relId,
      gross: cell(idx.gross),
      total: cell(idx.total),
      theaters: cell(idx.theaters),
      span: cell(idx.span),
      distributor: cell(idx.distributor).replace(/See full company information/i, "").trim()
    });
  });
  return out;
}

async function toItem(row, language, mode) {
  const movie = await searchTmdb(row.title, language);
  const desc = buildDescription(row, mode);

  if (!movie) return fallbackItem(row, mode);

  return {
    id: String(movie.id),
    type: "tmdb",
    mediaType: "movie",
    title: `${row.rank}. ${movie.title || row.title}`,
    originalTitle: row.title,
    description: desc,
    posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : undefined,
    releaseDate: movie.release_date || undefined,
    rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : undefined
  };
}

function fallbackItem(row, mode) {
  return {
    id: row.releaseId,
    type: "url",
    title: `${row.rank}. ${row.title}`,
    description: buildDescription(row, mode),
    link: row.releaseUrl
  };
}

function buildDescription(row, mode) {
  const parts = [];
  if (row.gross) parts.push(`${mode === "week" ? "本週" : "當日"} ${row.gross}`);
  if (row.total) parts.push(`累計 ${row.total}`);
  if (row.span) parts.push(`第 ${row.span} ${mode === "week" ? "週" : "天"}`);
  if (row.theaters && row.theaters !== "-") parts.push(`${row.theaters} 間戲院`);
  if (row.distributor && row.distributor !== "-") parts.push(row.distributor);
  return parts.join("｜");
}

// ---------- TMDB 匹配 ----------

async function searchTmdb(title, language) {
  const query = title.replace(/\s*\(\d{4}(?: Re-release)?\)\s*$/i, "").trim();
  const thisYear = new Date().getFullYear();

  const res = await Widget.tmdb.get("/search/movie", {
    params: { query, language, include_adult: false }
  });
  const results = (res && res.results) || [];
  if (!results.length) return null;

  // 優先選標題完全相符、且上映年份接近今年的
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(query);
  const scored = results.map((m) => {
    let score = 0;
    if (norm(m.original_title) === target || norm(m.title) === target) score += 10;
    const y = parseInt((m.release_date || "").slice(0, 4), 10);
    if (y) score += Math.max(0, 5 - Math.abs(thisYear - y));
    score += Math.min(3, (m.popularity || 0) / 50);
    return { m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].m;
}

// ---------- 工具 ----------

function cleanText(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(input, daysAgo) {
  const s = (input || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(Date.now() - daysAgo * 86400000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
