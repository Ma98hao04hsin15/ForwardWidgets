const WidgetMetadata = {
  id: "imdb.watchlist",
  title: "IMDb 用户 Watchlist",
  version: "1.0.0",
  author: "ChatGPT",
  description: "解析 IMDb 用户 Watchlist 页面，抓取所有 IMDb ID 列表。",
  site: "https://www.imdb.com",
  modules: [
    {
      title: "IMDb Watchlist 解析",
      requiresWebView: false,
      functionName: "loadWatchlistItems",
      cacheDuration: 1800, // 30分钟缓存
      params: [
        {
          name: "user_id",
          title: "IMDb 用户 ID",
          type: "string",
          placeholder: "ur123456789",
          required: true,
        },
      ],
    },
  ],
};

async function loadWatchlistItems({ user_id }) {
  if (!user_id) {
    throw new Error("请提供 IMDb 用户 ID，例如 ur204635540");
  }

  // IMDb Watchlist URL 格式
  const url = `https://www.imdb.com/user/${user_id}/watchlist/?ref_=nv_usr_wl_all_0`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error(`请求失败，状态码：${res.status}`);
    }

    const html = await res.text();

    // 用正则匹配所有 /title/tt1234567/ 链接
    const imdbIdSet = new Set();
    const regex = /\/title\/(tt\d{7,8})\//g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      imdbIdSet.add(match[1]);
    }

    const imdbIds = Array.from(imdbIdSet);

    // 返回符合 ForwardWidgets 期待格式的条目
    // 这里只返回 ID，UI 可以根据 ID 进一步请求详情
    const items = imdbIds.map((id) => ({
      imdb_id: id,
      title: `IMDb ID: ${id}`, // 这里可以先简单显示 ID
      url: `https://www.imdb.com/title/${id}/`,
    }));

    return {
      total: items.length,
      items,
    };
  } catch (error) {
    return {
      total: 0,
      items: [],
      error: error.message,
    };
  }
}

export { WidgetMetadata, loadWatchlistItems };
