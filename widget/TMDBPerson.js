WidgetMetadata = {
  id: "person.movie.tmdb",
  title: "TMDB人物影视作品",
  version: "1.0.4",
  requiredVersion: "0.0.1",
  description: "TMDB 个人相关影视作品数据",
  author: "Evan",
  site: "https://github.com/Ma98hao04hsin15/ForwardWidgets",
  cacheDuration: 172800,
  modules: [
    {
      id: "allWorks",
      title: "大陸演員",
      functionName: "getAllWorks",
      cacheDuration: 172800,
      params: [
        {
          name: "personId",
          title: "个人ID",
          type: "input",
          description: "在 TMDB 网站获取的数字 ID",
          placeholders: [
            { title: "靳东", value: "1727498" },
            { title: "楊玏", value: "2018045" },
            { title: "鍾漢良", value: "1183233" },
            { title: "鄧超", value: "99689" },
            { title: "冯绍峰", value: "936431" },
            { title: "胡歌", value: "1106514" },
            { title: "賈乃亮", value: "1435966" },
            { title: "李現", value: "1384277" },
            { title: "陸毅", value: "127269" },
            { title: "羅晉", value: "1115666" },
            { title: "孫紅雷", value: "73774" },
            { title: "王凱", value: "1559226" },
            { title: "張一山", value: "1191743" },
            { title: "鄭愷", value: "1279598" },
            { title: "朱一龍", value: "1743471" },
            { title: "白宇", value: "1698814" },
            { title: "檀健次", value: "2122379" },
            { title: "任嘉倫", value: "2084465" },
            { title: "白敬亭", value: "1672869" },
            { title: "張若昀", value: "1675905" },
            { title: "吳磊", value: "1438264" },
            { title: "陳曉", value: "1192909" },
            { title: "張新成", value: "2027708" },
            { title: "張晚意", value: "3028958" },
            { title: "白宇帆", value: "2973248" },
            { title: "王星越", value: "3157355" },
            { title: "黃景瑜", value: "1816461" },
            { title: "李昀銳", value: "2306608" },
            { title: "許凱", value: "2091759" },
            { title: "魏哲鳴", value: "1914924" },
            { title: "王子奇", value: "1989508" },
            { title: "李佳航", value: "1260866" },
            { title: "張彬彬", value: "1701963" },
            { title: "羅雲熙", value: "2085450" },
            { title: "高以翔", value: "1192915" },
            { title: "于和偉", value: "1344903" },
            { title: "竇驍", value: "145093" },
            { title: "朱亞文", value: "1376105" },
            { title: "佟大為", value: "1031246" },
            { title: "聶遠", value: "1251627" },
            { title: "王玉雯", value: "1836775" },
            { title: "胡意旋", value: "2164832" },
            { title: "楊蓉", value: "1258369" },
            { title: "虞書欣", value: "2140103" },
            { title: "迪麗熱巴", value: "1557698" },
            { title: "宋軼", value: "1877119" },
            { title: "張慧雯", value: "1376103" },
            { title: "吳謹言", value: "2091760" },
            { title: "宋祖兒", value: "2104489" },
            { title: "金晨", value: "1541648" },
            { title: "王安宇", value: "2482605" },
            { title: "向涵之", value: "2581662" },
            { title: "趙麗穎", value: "1260868" },
            { title: "馬思純", value: "1476994" },
            { title: "李沁", value: "568304" },
            { title: "白鹿", value: "1879666" },
            { title: "吴倩", value: "1677008" },
            { title: "刘亦菲", value: "122503" },
            { title: "舒淇", value: "21911" },
            { title: "秦嵐", value: "1018709" },
            { title: "童瑤", value: "1298729" },
            { title: "袁姗姗", value: "1192905" },
            { title: "萬茜", value: "1355203" },
            { title: "菅纫姿", value: "1756427" },
            { title: "楊采鈺", value: "1276628" },
            { title: "鍾楚曦", value: "1815238" },
            { title: "董潔", value: "12676" },
            { title: "劉詩詩", value: "1185786" },
            { title: "倪妮", value: "1006864" },
            { title: "劉濤", value: "1236264" },
            { title: "佳寧", value: "1829558" },
            { title: "江疏影", value: "1590275" },
            { title: "韓雪", value: "1479864" },
            { title: "鄧家佳", value: "1059217" },
            { title: "袁泉", value: "1172609" },
            { title: "張歆藝", value: "126851" },
            { title: "焦俊艳", value: "1353694" },
            { title: "米露", value: "1502598" },
            { title: "湯唯", value: "38280" },
            { title: "俞飞鸿", value: "39831" },
            { title: "王麗坤", value: "1251113" },
            { title: "蔣欣", value: "1241445" },
            { title: "李念", value: "2166987" },
            { title: "任素汐", value: "1696089" },
            { title: "宋佳", value: "96614" },
            { title: "唐嫣", value: "99691" },
            { title: "王子文", value: "1006594" },
            { title: "高露", value: "1630009" },
            { title: "白百何", value: "588057" },
            { title: "唐艺昕", value: "1539646" },
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
      params: [
      ]
    },
    {
      id: "directorWorks",
      title: "导演作品",
      functionName: "getDirectorWorks",
      cacheDuration: 172800,
      params: [
      ]
    },
    {
      id: "otherWorks",
      title: "其他作品",
      functionName: "getOtherWorks",
      cacheDuration: 172800,
      params: []
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
    return Object.assign({}, item, {
      mediaType: item.media_type,
      releaseDate: item.release_date || item.first_air_date
    });
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
      sorted.sort(function(a, b) {
        return (b.vote_average || 0) - (a.vote_average || 0);
      });
      break;
    case "release_date.desc":
      sorted.sort(function(a, b) {
        return new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date);
      });
      break;
    // popularity.desc 默认顺序已由 TMDB 返回
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
      rating: movie.vote_average,
      mediaType: movie.mediaType
    };
  });
}

// 各模块函数
async function getAllWorks(params) {
  var p = params || {};
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.cast.concat(credits.crew);
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}
async function getActorWorks(params) {
  var p = params || {};
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.cast;
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}
async function getDirectorWorks(params) {
  var p = params || {};
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.crew.filter(function(item) {
    return item.job && item.job.toLowerCase().indexOf("director") !== -1;
  });
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}
async function getOtherWorks(params) {
  var p = params || {};
  var credits = await fetchCredits(p.personId, p.language);
  var list = credits.crew.filter(function(item) {
    var job = item.job && item.job.toLowerCase();
    return job && job.indexOf("director") === -1 && job.indexOf("actor") === -1;
  });
  list = filterByType(list, p.type);
  list = applySorting(list, p.sort_by);
  return formatResults(list);
}
