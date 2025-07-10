WidgetMetadata = {
  id: "imdb",
  title: "IMDB",
  description: "IMDB",
  author: "Joey",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "IMDB 片单",
      description: "IMDB 片单",
      requiresWebView: false,
      functionName: "loadCardItems",
      params: [
      {
          name: "url",
          title: "列表地址",
          type: "input",
          description: "IMDB 片单地址",
          placeholders: [
            {
              title: "北京电影学院硕士要看的100部电影",
              value: "https://www.imdb.com/list/ls599235177/",
            },
            {
              title: "1100 Movies you must see before you die",
              value: "https://www.imdb.com/list/ls002448041/",
            },
            { name: "page", title: "页码", type: "page" },
            { name: "limit", title: "🔢 每页数量", type: "constant", value: "50" }
          ],
        },
      ],
    },
  ],
};

// ===============辅助函数===============
function formatItemDescription(item) {
    let description = item.description || '';
    const hasRating = /评分|rating/i.test(description);
    const hasYear = /年份|year/i.test(description);
    
    if (item.rating && !hasRating) {
        description = `评分: ${item.rating} | ${description}`;
    }
    
    if (item.releaseDate && !hasYear) {
        const year = String(item.releaseDate).substring(0,4);
        if (/^\d{4}$/.test(year)) {
            description = `年份: ${year} | ${description}`;
        }
    }
    
    return description
        .replace(/^\|\s*/, '')
        .replace(/\s*\|$/, '')
        .trim();
}

function createErrorItem(id, title, error) {
    const errorMessage = String(error?.message || error || '未知错误');
    const uniqueId = `error-${id.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    return {
        id: uniqueId,
        type: "error",
        title: title || "加载失败",
        description: `错误详情：${errorMessage}`
    };
}

function calculatePagination(params) {
    let page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 50;
    
    if (typeof params.start !== 'undefined') {
        page = Math.floor(parseInt(params.start) / limit) + 1;
    }
    
    if (page < 1) page = 1;
    if (limit > 50) throw new Error("单页数量不能超过50");

    const start = (page - 1) * limit;
    return { page, limit, start };
}

function getBeijingDate() {
    const now = new Date();
    
    const beijingTime = now.getTime() + (8 * 60 * 60 * 1000);
    const beijingDate = new Date(beijingTime);
    
    const year = beijingDate.getUTCFullYear();
    const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingDate.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

async function loadCardItems(params = {}) {
  const url = params.url;
  if (!url) {
    console.error("缺少片单 URL");
    throw new Error("缺少片单 URL");
  }

  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  if (!response || !response.data) {
    throw new Error("获取片单数据失败");
  }

  console.log(response.data);
  const videoIds = [];

  //load application/ld+json content
  const ldJson = response.data.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/
  )
  if (ldJson && ldJson[1]) {
    const json = JSON.parse(ldJson[1]);
    console.log(json);
    for (const item of json.itemListElement) {
      //regex ttxxxx id
      const match = item.item.url.match(/tt(\d+)/);
      if (match && match[1]) {
        videoIds.push({
          id: `tt${match[1]}`,
          type: "imdb",
          title: item.name,
          description: item.description,
          coverUrl: item.image,
        });
      }
    }
  } else {
    const docId = Widget.dom.parse(response.data);
    if (docId < 0) {
      throw new Error("解析 HTML 失败");
    }
    const videoElementIds = Widget.dom.select(docId, ".ipc-metadata-list-summary-item .ipc-poster a");
    for (const itemId of videoElementIds) {
      const link = await Widget.dom.attr(itemId, "href");
      const id = link.match(/tt(\d+)/);
      if (id && id[1]) {
        videoIds.push({ id: `tt${id[1]}`, type: "imdb" });
      }
    }
  }

  console.log(videoIds);
  return videoIds;
}
