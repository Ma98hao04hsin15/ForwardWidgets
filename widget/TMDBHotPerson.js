WidgetMetadata = {
  id: "person.movie.tmdb",
  title: "TMDB人物影视作品",
  version: "1.0.5",
  requiredVersion: "0.0.1",
  description: "获取 TMDB 随机50热门人物模块相关作品数据",
  author: "Joey + ChatGPT",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets",
  cacheDuration: 172800,
  modules: [
    {
      id: "allWorks",
      title: "全部作品",
      functionName: "getAllWorks",
      cacheDuration: 172800,
      params: [
        {
          name: "personId",
          title: "个人ID",
          type: "input",
          description: "在 TMDB 网站获取的数字 ID",
          placeholders: [
            { title: "张艺谋", value: "607" },
            { title: "李安", value: "1614" },
            { title: "周星驰", value: "57607" }
            // 省略其他示例
          ]
        },
        { name: "language", title: "语言", type: "language", value: "zh-CN" },
        {
          name: "type",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "电影", value: "movie" },
            { title: "电视剧", value: "tv" }
          ],
          value: "all"
        },
        {
          name: "sort_by",
          title: "排序方式",
          type: "enumeration",
          enumOptions: [
            { title: "发行日期降序", value: "release_date.desc" },
            { title: "评分降序", value: "vote_average.desc" },
            { title: "热门降序", value: "popularity.desc" }
          ],
          value: "popularity.desc"
        }
      ]
    },
    {
      id: "actorWorks",
      title: "演员作品",
      functionName: "getActorWorks",
      cacheDuration: 172800,
      params: []
    },
    {
      id: "directorWorks",
      title: "导演作品",
      functionName: "getDirectorWorks",
      cacheDuration: 172800,
      params: []
    },
    {
      id: "otherWorks",
      title: "其他作品",
      functionName: "getOtherWorks",
      cacheDuration: 172800,
      params: []
    },
    {
      id: "randomPopularPersons",
      title: "随机热门人物(50位)",
      functionName: "getRandomPopularPersons",
      cacheDuration: 86400,
      params: [
        { name: "pages", title: "抓取热门人物页数", type: "number", value: 3 },
        { name: "language", title: "语言", type: "language", value: "zh-CN" }
      ]
    }
  ]
};

// 复用 allWorks 参数到其他模块
["actorWorks", "directorWorks", "otherWorks"].forEach(id => {
  var module = WidgetMetadata.modules.find(m => m.id === id);
  module.params = JSON.parse(JSON.stringify(WidgetMetadata.modules[0].params));
});

// 基础获取TMDB人员作品方法,使用 combined_credits 接口
async function fetchCredits(personId, language) {
  var api = `person/${personId}/combined_credits`;
  var response = await Widget.tmdb.get(api, { params: { language: language || "zh-CN" } });
  if (!response || (!response.cast && !response.crew)) {
    throw new Error("获取作品数据失败");
  }

  var normalize = function(item) {
    return {
      ...item,
      mediaType: item.media_type,
      releaseDate: item.release_date || item.first_air_date || "",
      rating: item.vote_average || 0,
      popularity: item.popularity || 0
    };
  };

  return {
    cast: (response.cast || []).map(normalize),
    crew: (response.crew || []).map(normalize)
  };
}

// 过滤函数：按 mediaType 筛选
function filterByType(items, targetType) {
  return targetType === "all" ? items : items.filter(item => item.mediaType === targetType);
}

// 排序函数：根据 sort_by 参数排序
function applySorting(items, sortBy) {
  var sorted = items.slice();
  switch (sortBy) {
    case "vote_average.desc":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "release_date.desc":
      sorted.sort((a, b) => (Date.parse(b.releaseDate) || 0) - (Date.parse(a.releaseDate) || 0));
      break;
    case "popularity.desc":
      sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      break;
  }
  return sorted;
}

// 合并去重并格式化输出的通用函数
function formatResults(items) {
  var seen = {};
  var result = [];
  items.forEach(function(item) {
    if (!seen[item.id]) {
      seen[item.id] = true;
      result.push(item);
    }
  });
  return result.map(function(movie) {
    return {
      id: movie.id,
      type: "tmdb",
      title: movie.title || movie.name,
      description: movie.overview,
      releaseDate: movie.releaseDate,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      rating: movie.rating,
      mediaType: movie.mediaType,
      tmdbUrl: `https://www.themoviedb.org/${movie.mediaType}/${movie.id}`
    };
  });
}

// 各模块函数
async function getAllWorks(params) {
  var p = params || {};
  if (!p.personId) throw new Error("必须提供 personId");
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.cast.concat(credits.crew);
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}

async function getActorWorks(params) {
  var p = params || {};
  if (!p.personId) throw new Error("必须提供 personId");
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.cast;
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}

async function getDirectorWorks(params) {
  var p = params || {};
  if (!p.personId) throw new Error("必须提供 personId");
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.crew.filter(item => item.job && item.job.toLowerCase().includes("director"));
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}

async function getOtherWorks(params) {
  var p = params || {};
  if (!p.personId) throw new Error("必须提供 personId");
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.crew.filter(item => {
    let job = item.job && item.job.toLowerCase();
    return job && !job.includes("director") && !job.includes("actor");
  });
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}

// 新增：抓取热门人物的函数
async function fetchPopularPersons(pages = 3, language = "zh-CN") {
  let persons = [];
  for (let page = 1; page <= pages; page++) {
    let response = await Widget.tmdb.get("person/popular", {
      params: { language, page }
    });
    if (response && response.results) {
      persons = persons.concat(response.results);
    } else {
      break;
    }
  }
  return persons;
}

// 新增：随机挑选 N 位人物
function pickRandomPersons(persons, count = 50) {
  let shuffled = persons.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// 新增：模块函数 - 获取随机50热门人物ID列表
async function getRandomPopularPersons(params) {
  var p = params || {};
  var pages = p.pages || 3;
  var language = p.language || "zh-CN";
  let popularPersons = await fetchPopularPersons(pages, language);
  let randomPersons = pickRandomPersons(popularPersons, 50);
  return randomPersons.map(p => ({
    id: p.id,
    name: p.name,
    profilePath: p.profile_path,
    tmdbUrl: `https://www.themoviedb.org/person/${p.id}`
  }));
}

// --- 以下是示例调用 ---
// 你可以在调用处运行这个 async 函数测试
async function demoRandomPersons() {
  let randomPersons = await getRandomPopularPersons({ pages: 3, language: "zh-CN" });
  console.log("随机50热门人物:", randomPersons);
  // 示例：获取第一位人物的作品
  if (randomPersons.length > 0) {
    let firstId = randomPersons[0].id;
    let works = await getAllWorks({ personId: firstId, language: "zh-CN", type: "all", sort_by: "popularity.desc" });
    console.log(`人物 ${randomPersons[0].name} 的作品:`, works);
    return works;
  }
  return [];
}
