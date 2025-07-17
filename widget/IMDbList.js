WidgetMetadata = {
  id: "ImdbListOnly",
  title: "IMDb片单",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "仅提取 IMDb 用户列表中内容并转换为 IMDb ID",
  author: "huangxd",
  site: "https://github.com/huangxd-/ForwardWidgets",
  modules: [
    {
      title: "IMDb片单",
      requiresWebView: false,
      functionName: "loadListItems",
      cacheDuration: 86400,
      params: [
        {
          name: "list_id",
          title: "IMDb 列表 ID",
          type: "input",
          description: "如：ls009952442，未填写情况下无法使用",
        },
        {
          name: "sort_by",
          title: "排序依据",
          type: "enumeration",
          enumOptions: [
            { title: "排名顺序", value: "list_order" },
            { title: "发布日期", value: "release_date" },
            { title: "IMDb 评分", value: "ir" },
            { title: "添加时间", value: "date_added" },
          ],
        },
        {
          name: "sort_how",
          title: "排序方向",
          type: "enumeration",
          enumOptions: [
            { title: "正序", value: "asc" },
            { title: "反序", value: "desc" },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
    },
  ],
};

async function loadListItems(params = {}) {
  const listId = params.list_id || "";
  const sortBy = params.sort_by || "list_order";
  const sortHow = params.sort_how || "asc";
  const page = params.page || 1;

  if (!listId) {
    throw new Error("必须提供 IMDb 列表 ID");
  }

  // 构造 IMDb 列表页 URL
  const url = `https://www.imdb.com/list/${listId}/?sort=${sortBy},${sortHow}&mode=detail&page=${page}`;

  // 发起请求
  const response = await Widget.http.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  // 解析 DOM，选出每条目标题链接
  const docId = Widget.dom.parse(response.data);
  const linkEls = Widget.dom.select(
    docId,
    '.lister-list .lister-item-header a[href^="/title/tt"]'
  );

  // 提取 ttID，去重并封装返回
  const imdbIds = Array.from(
    new Set(
      linkEls
        .map((el) => el.getAttribute?.("href") || Widget.dom.attr(el, "href"))
        .map((href) => {
          const m = href.match(/title\/(tt\d+)/);
          return m ? m[1] : null;
        })
        .filter(Boolean)
    )
  ).map((id) => ({ id, type: "imdb" }));

  return imdbIds;
}
