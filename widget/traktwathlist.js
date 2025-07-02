const WidgetMetadata = {
  id: "trakt",
  title: "Trakt我看&个性化推荐",
  version: "1.0.11",
  requiredVersion: "0.0.1",
  description: "抓取 Trakt 想看、在看、看过、片单与推荐数据",
  author: "huangxd",
  modules: [
    {
      title: "Trakt 我看",
      requiresWebView: false,
      functionName: "loadInterestItems",
      cacheDuration: 3600,
      params: [
        { name: "user_name", title: "Trakt 用户名", type: "input", description: "必填" },
        {
          name: "status",
          title: "状态",
          type: "enum",
          enumOptions: [
            { title: "想看", value: "watchlist" },
            { title: "在看", value: "progress" },
            { title: "看过", value: "history" },
            { title: "随机想看", value: "random_watchlist" },
          ],
        },
        { name: "page", title: "页码", type: "page" }
      ],
    },
    {
      title: "Trakt 推荐",
      requiresWebView: false,
      functionName: "loadSuggestionItems",
      cacheDuration: 3600,
      params: [
        { name: "cookie", title: "Trakt Cookie", type: "input", description: "用户登录后 Cookie" },
        { name: "page", title: "页码", type: "page" }
      ],
    }
  ]
};

async function fetchTraktData(url, headers = {}, status, minNum, maxNum, random=false, order="") {
  // 发请求、解析 & 提取 imdb id
  // 代码与原 trakt.js 基本一致
}

async function loadInterestItems(params = {}) {
  const user = params.user_name || "";
  const status = params.status || "watchlist";
  const page = params.page || 1;
  if (!user) throw new Error("请填写Trakt用户名");
  const count = 20;
  const size = status === "watchlist" ? 6 : 3;
  const minNum = ((page - 1) % size) * count + 1;
  const maxNum = minNum + count - 1;
  const traktPage = Math.floor((page - 1) / size) + 1;
  const random = status === "random_watchlist";
  const url = `https://trakt.tv/users/${user}/${status.replace("random_", "")}?page=${traktPage}`;
  return fetchTraktData(url, {}, status.replace("random_", "watchlist"), minNum, maxNum, random);
}

async function loadSuggestionItems(params = {}) {
  const cookie = params.cookie || "";
  const page = params.page || 1;
  if (!cookie) throw new Error("请填入登录后的 Trakt Cookie");
  const count = 20, min = (page-1)*count+1, max = page*count;
  const url = `https://trakt.tv/recommendations/movies`; // 或 /shows，视你的需求
  return fetchTraktData(url, { Cookie: cookie }, "", min, max);
}
