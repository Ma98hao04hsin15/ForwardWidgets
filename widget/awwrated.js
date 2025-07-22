// Netflix / Disney+ 避雷榜单
WidgetMetadata = 
  {
  title: "串流避雷精选",
  description: "从 awwrated 获取 Netflix/Disney+ 的热度、即将下架、编辑推荐等信息",
  requiresWebView: false,
  functionName: "getAwwRatedStream",
  cacheDuration: 3600,
  params: [
    {
      name: "platform",
      title: "平台",
      type: "enumeration",
      enumOptions: [
        { title: "Netflix", value: "netflix" },
        { title: "Disney+", value: "disney" }
      ]
    },
    {
      name: "category",
      title: "类别",
      type: "enumeration",
      enumOptions: [
        { title: "熱門趨勢", value: "trend" },
        { title: "即將下架", value: "leaving" },
        { title: "編輯推薦", value: "editor" }
      ]
    },
    {
      name: "timeframe",
      title: "時間週期",
      type: "enumeration",
      enumOptions: [
        { title: "今日", value: "daily" },
        { title: "本週", value: "weekly" },
        { title: "本月", value: "monthly" },
        { title: "總榜", value: "alltime" }
      ]
    },
    {
      name: "region",
      title: "地區篩選",
      type: "enumeration",
      enumOptions: [
        { title: "全部／全球", value: "" },
        { title: "美國", value: "USA" },
        { title: "台灣", value: "Taiwan" },
        { title: "韓國", value: "Korea" },
        { title: "日本", value: "Japan" },
        { title: "英國", value: "UK" },
        { title: "中國", value: "China" }
      ]
    },
    {
      name: "genre",
      title: "類型",
      type: "enumeration",
      enumOptions: [
        { title: "全部", value: "" },
        { title: "劇情", value: "Drama" },
        { title: "喜劇", value: "Comedy" },
        { title: "驚悚", value: "Thriller" },
        { title: "懸疑", value: "Mystery" },
        { title: "科幻", value: "Sci-Fi" },
        { title: "動作", value: "Action" },
        { title: "恐怖", value: "Horror" },
        { title: "紀錄片", value: "Documentary" },
        { title: "動畫", value: "Anime" },
        { title: "家庭", value: "Family" }
      ]
    },
    {
      name: "offset",
      title: "起始位置",
      type: "offset"
    }
  ]
};


async function getAwwRatedStream(params = {}) {
  const { platform="netflix", category="trend", timeframe="daily", region="", genre="", offset=0 } = params;
  const base = "https://awwrated.com/zh-tw";
  let path = "";

  if (category === "trend") {
    path = `/${platform}`; // 例如 "/netflix"，会显示多种热门趋势（日／週／月／總榜）
  } else if (category === "leaving") {
    path = `/leaving-soon`; // 即將下架页面
  } else if (category === "editor") {
    path = `/zh-tw/netflix/editorial`;//如果编辑推荐有独立页面
  }

  const url = `${base}${path}`;
  const res = await Widget.http.get(url, {
    headers: { "User-Agent": USER_AGENT }
  });

  // 解析 HTML，提取列表项：标题、评分、类型、地区、总结、到期日等信息；
  // 此处建议用正则或 DOM 解析进行抽取
  const items = parseAwwRatedHTML(res.data, {category, timeframe, region, genre});
  return items.slice(offset, offset + 20); // 分页
}
