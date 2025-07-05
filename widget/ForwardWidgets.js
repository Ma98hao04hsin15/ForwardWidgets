WidgetMetadata = {
  id: "forward.combined.media.lists",
  title: "Forw​​ardWidget豆瓣影视榜单",
  description: "基于Forw​​ardWidget架构导入豆瓣影视模块",
  author: "乔伊",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "1.2.7",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    // =============豆瓣模块=============
    // --- 🏆 豆瓣自定义片单 ---
    {
      title: "豆瓣自定义片单",
      description: "加载豆瓣官方榜单或用户豆列 (需输入 URL)",
      requiresWebView: false,
      functionName: "loadDoubanCardItems",
      cacheDuration: 3600,
      params: [
        {
          name: "url", 
          title: "🔗 列表地址", 
          type: "input", 
          description: "输入豆瓣片单或榜单地址 (subject_collection 或 doulist)",
          placeholders: [
            { title: "2024年上半年高分电影Top50", 
              value: "https://m.douban.com/subject_collection/EC446NAZA?type=rank" },
            { title: "冷门悬疑加片Top20", 
              value: "https://m.douban.com/subject_collection/ECKQN7THI?type=rank" },
            { title: "2025年7月定档热门电影推荐", 
              value: "https://m.douban.com/subject_collection/ECEY7ZCTY?type=rank" },
            { title: "2025年定档热门电影推荐", 
              value: "https://m.douban.com/subject_collection/ECQA7W5SQ?type=rank" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "25" }
      ]
    },

    // =============IMDB模块=============
    {
      title: "IMDb Top 250 电影",
      description: "IMDb 用户评分最高的 250 部电影",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      cacheDuration: 3600,
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://www.imdb.com/chart/top/?ref_=nv_mv_250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "50" }
      ]
    },
    {
      title: "IMDb Top 250 剧集",
      description: "IMDb 用户评分最高的 250 部剧集",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      cacheDuration: 3600,
      params: [
        { name: "url", 
          title: "🔗 列表地址", 
          type: "constant", 
          value: "https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250" },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "50" }
      ]
    },
    {
      title: "IMDB 自定义片单",
      description: "解析 IMDB 热门电影/剧集等网页片单 (需输入 URL)",
      requiresWebView: false,
      functionName: "loadImdbCardItems",
      cacheDuration: 3600,
      params: [
        {
          name: "url", 
          title: "🔗 列表地址", 
          type: "input", 
          description: "输入 IMDB 片单或榜单地址",
          placeholders: [
            { title: "时下热门电影", 
              value: "https://www.imdb.com/chart/moviemeter/?ref_=nv_mv_mpm" },
            { title: "时下热门剧集", 
              value: "https://www.imdb.com/chart/tvmeter/?ref_=nv_tvv_mptv" }
          ]
        },
        { name: "page", title: "页码", type: "page" },
        { name: "limit", title: "🔢 每页数量", type: "constant", value: "50" }
      ]
    },

    }
  ]
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
    const limit = parseInt(params.limit) || 20;
    
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
// ===============豆瓣功能函数===============
async function loadDoubanCardItems(params = {}) {
  try {
    const url = params.url;
    if (!url) throw new Error("缺少片单 URL");
    if (url.includes("douban.com/doulist/")) {
      return loadDoubanDefaultList(params);
    } else if (url.includes("douban.com/subject_collection/")) {
      return loadDoubanSubjectCollection(params);
    } else {
        throw new Error("不支持的豆瓣 URL 格式");
    }
  } catch (error) {
    console.error("解析豆瓣片单失败:", error);
    throw error;
  }
}

async function loadDoubanDefaultList(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const listId = url.match(/doulist\/(\d+)/)?.[1];
  if (!listId) throw new Error("无法从 URL 获取豆瓣豆列 ID");
  const pageUrl = `https://www.douban.com/doulist/${listId}/?start=${start}&sort=&playable=&sub_type=`;
  const response = await Widget.http.get(pageUrl, {
    headers: {
      Referer: `https://www.douban.com/`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });
  if (!response || !response.data) throw new Error("获取豆瓣豆列数据失败");
  const docId = Widget.dom.parse(response.data);
  if (docId < 0) throw new Error("解析豆瓣豆列 HTML 失败");
  const itemElements = Widget.dom.select(docId, "div.doulist-item");
  let fallbackItemElements = [];
  if (!itemElements || itemElements.length === 0) {
       const articleElement = Widget.dom.selectFirst(docId, ".article");
       if (articleElement >= 0) {
            fallbackItemElements = Widget.dom.select(articleElement, ".doulist-subject");
            if (!fallbackItemElements || fallbackItemElements.length === 0) {
                 fallbackItemElements = Widget.dom.select(articleElement, "li.subject-item");
            }
       }
  }
  const finalItemElements = (itemElements && itemElements.length > 0) ? itemElements : fallbackItemElements;
  if (!finalItemElements || finalItemElements.length === 0) {
      const paging = Widget.dom.selectFirst(docId, ".paginator .next a");
      if (paging < 0) {
          return [];
      } else {
           return [];
      }
  }
  let doubanIds = [];
  for (const itemId of finalItemElements) {
       let titleElementId = Widget.dom.selectFirst(itemId, ".title a");
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, ".item-title a");
       }
       if (titleElementId < 0) {
           titleElementId = Widget.dom.selectFirst(itemId, "a[onclick*='subject']");
       }
      if (titleElementId >= 0) {
          const link = await Widget.dom.attr(titleElementId, "href");
          const idMatch = link ? link.match(/subject\/(\d+)/) : null;
          const title = await Widget.dom.text(titleElementId);
          if (idMatch && idMatch[1]) {
              let coverUrl = "";
              let imgElementId = Widget.dom.selectFirst(itemId, ".post img");
              if (imgElementId < 0) {
                 imgElementId = Widget.dom.selectFirst(itemId, ".item-poster img");
              }
              if (imgElementId >= 0) {
                  coverUrl = await Widget.dom.attr(imgElementId, "src");
                   if (coverUrl) {
                       coverUrl = coverUrl.replace(/\/(s|m|sq)\//, '/l/');
                   }
              }
              let description = "";
              let abstractElementId = Widget.dom.selectFirst(itemId, ".abstract");
              if (abstractElementId < 0) {
                  abstractElementId = Widget.dom.selectFirst(itemId, ".card-abstract");
              }
               if (abstractElementId >= 0) {
                   description = await Widget.dom.text(abstractElementId);
                   description = description.trim().replace(/\n\s*/g, ' ');
               }
              let rating = undefined;
              let ratingElementId = Widget.dom.selectFirst(itemId, ".rating .rating_nums");
              if (ratingElementId < 0) {
                  ratingElementId = Widget.dom.selectFirst(itemId, ".item-rating .rating_nums");
              }
              if (ratingElementId >= 0) {
                  rating = await Widget.dom.text(ratingElementId);
                  rating = rating.trim();
              }
              doubanIds.push({
                  id: idMatch[1],
                  type: "douban",
                  title: title ? title.trim() : "未知标题",
                  coverUrl: coverUrl || undefined,
                  description: formatItemDescription({
                      description: description || undefined,
                      rating: rating,
                      releaseDate: item.releaseDate
                  }),
                  rating: rating ? parseFloat(rating) : undefined
                });
          } else {
             console.warn("解析豆列项时未找到 subject ID, Title:", title, "Link:", link);
          }
      } else {
         console.warn("在豆列项中未找到标题链接元素, Item ID:", itemId);
      }
  }
  return doubanIds;
}

async function loadDoubanItemsFromApi(params = {}) {
  const { start, limit } = calculatePagination(params);
  const url = params.url;
  const apiUrl = `${url}?start=${start}&count=${limit}&updated_at&items_only=1&for_mobile=1`;
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  const referer = listIdMatch ? `https://m.douban.com/subject_collection/${listIdMatch[1]}/` : 'https://m.douban.com/';
  const response = await Widget.http.get(apiUrl, {
    headers: {
      Referer: referer,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });
  if (response.data && response.data.subject_collection_items) {
    const items = response.data.subject_collection_items;
    const doubanIds = items.map((item) => ({
      id: item.id,
      type: "douban",
      title: item.title,
      coverUrl: item.cover?.url,
      description: formatItemDescription({
          description: item.card_subtitle || item.description,
          rating: item.rating?.value,
          releaseDate: item.year
      }),
      rating: item.rating?.value,
      releaseDate: item.year
    }));
    return doubanIds;
  }
  return [];
}

async function loadDoubanSubjectCollection(params = {}) {
  const listIdMatch = params.url.match(/subject_collection\/(\w+)/);
  if (!listIdMatch) throw new Error("无法从 URL 获取豆瓣合集 ID");
  const listId = listIdMatch[1];
  const { start, limit } = calculatePagination(params);
  const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${listId}/items`;
  return await loadDoubanItemsFromApi({
      ...params,
      url: apiUrl,
  });
}

async function loadDoubanRecommendMovies(params = {}) {
  return await loadDoubanRecommendItems(params, "movie");
}

async function loadDoubanRecommendShows(params = {}) {
  return await loadDoubanRecommendItems(params, "tv");
}

async function loadDoubanRecommendItems(params = {}, mediaType = "movie") {
  const { start, limit } = calculatePagination(params);
  const category = params.category || "";
  const subType = params.type || "";
  const tags = params.tags || "";
  const sortBy = params.sort_by || "T";
  const encodedTags = encodeURIComponent(tags);
  
  let url;
  if (category === "全部" || category === "all") {
    url = `https://m.douban.com/rexxar/api/v2/${mediaType}/recommend?refresh=0&start=${start}&count=${limit}&selected_categories=${encodeURIComponent(JSON.stringify(params.selected_categories || {}))}&uncollect=false&score_range=0,10`;
    if (encodedTags) url += `&tags=${encodedTags}`;
    url += `&sort=${sortBy}`; 
  } else {
    url = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${mediaType}?start=${start}&count=${limit}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(subType)}&sort=${sortBy}`;
  }

  const response = await Widget.http.get(url, {
    headers: {
      Referer: `https://movie.douban.com/explore`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  });

  const items = response.data?.subjects || response.data?.items || [];
  return items.map((item) => {
    const rating = item.rating?.value || (item.rate ? parseFloat(item.rate) : undefined);
    const releaseYear = item.year || item.release_date?.substring(0, 4);
    const cover = item.cover?.url || item.pic?.normal;
    
    let dynamicDesc = "";
    switch(sortBy) {
      case "U":
        dynamicDesc = "近期热度排序";
        break;
      case "R":
        dynamicDesc = `首映时间: ${releaseYear || '未知'}`;
        break;
      case "S":
        dynamicDesc = `评分: ${rating?.toFixed(1) || '无'}`;
        break;
      default: // T
        dynamicDesc = item.card_subtitle || item.description || "";
    }

    return {
      id: String(item.id),
      type: "douban",
      title: item.title,
      coverUrl: cover,
      description: formatItemDescription({
        description: dynamicDesc,
        rating: rating,
        releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
      }),
      rating: rating,
      releaseDate: releaseYear ? `${releaseYear}-01-01` : undefined
    };
  });
}

//===============IMDB功能函数===============
async function loadImdbCardItems(params = {}) {
  const url = params.url;
  if (!url) throw new Error("缺少 IMDB 片单 URL");
  const response = await Widget.http.get(url, {
    headers: {
      Referer: "https://www.imdb.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    },
  });
  if (!response || !response.data) throw new Error("获取 IMDB 片单数据失败");
  const videoIds = [];
  const ldJsonMatch = response.data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (ldJsonMatch && ldJsonMatch[1]) {
      try {
          const json = JSON.parse(ldJsonMatch[1]);
          if (json && json.itemListElement && Array.isArray(json.itemListElement)) {
              for (const item of json.itemListElement) {
                  if (item && item.item && item.item.url) {
                      const idMatch = item.item.url.match(/(tt\d+)/);
                      if (idMatch && idMatch[1]) {
                          videoIds.push({
                              id: idMatch[1],
                              type: "imdb",
                              title: item.item.name || "Unknown Title",
                              coverUrl: item.item.image || undefined,
                          });
                      }
                  }
              }
          }
      } catch (e) {
          console.warn("解析 LD+JSON 失败:", e);
      }
  }
  if (videoIds.length === 0) {
      const docId = Widget.dom.parse(response.data);
      if (docId < 0) throw new Error("解析 IMDB HTML 失败");
      const itemElementIds = Widget.dom.select(docId, "ul.ipc-metadata-list > li, .lister-list > tr");
      for (const itemId of itemElementIds) {
          try {
              const linkElementId = Widget.dom.selectFirst(itemId, ".ipc-title__text, .titleColumn a");
              let link = "";
              let title = "";
              if (linkElementId >= 0) {
                  const titleText = await Widget.dom.text(linkElementId);
                  title = titleText ? titleText.replace(/^\d+\.\s*/, '').trim() : "Unknown Title";
                  const titleLinkElementId = Widget.dom.selectFirst(itemId, "a.ipc-title-link-wrapper, .titleColumn a");
                   if (titleLinkElementId >= 0) {
                       link = await Widget.dom.attr(titleLinkElementId, "href");
                   }
              }
              if (link) {
                  const idMatch = link.match(/(tt\d+)/);
                  if (idMatch && idMatch[1]) {
                      let coverUrl = "";
                      const imgElementId = Widget.dom.selectFirst(itemId, ".ipc-poster img, .posterColumn img");
                      if (imgElementId >= 0) {
                          coverUrl = await Widget.dom.attr(imgElementId, "src");
                          if (coverUrl && coverUrl.startsWith('//')) coverUrl = 'https:' + coverUrl;
                          if (coverUrl) coverUrl = coverUrl.replace(/\/(c|g|s)\//, '/l/');
                      }
                      videoIds.push({
                          id: idMatch[1],
                          type: "imdb",
                          title: title || "Unknown Title",
                          coverUrl: coverUrl || undefined,
                          description: ""
                        });
                  }
              }
          } catch (parseError) {
              console.error("IMDB 解析错误:", parseError);
          }
      }
  }
  const { start, limit } = calculatePagination(params);
  const end = start + limit;
  return videoIds.slice(start, end);
}
