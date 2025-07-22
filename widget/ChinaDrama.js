WidgetMetadata = {
  id: "vlinkage_cdrama_rank",
  title: "VLinkage 陸劇播放指數排行榜",
  description: "抓取 VLinkage 官方微博最新陸劇播放指數排名",
  version: "1.0.0",
  author: "Your Name",
  requires: ">=1.0.0",
  modules: [{
    functionName: "getRank",
    webview: false,
    sectionMode: false,
    cache: { ttl: 3600 },
    params: []
  }]
};

async function getRank() {
  const res = await Widget.http.get("https://m.weibo.cn/u/2041291667");
  const $ = Widget.dom.parse(res.data);
  const items = [];
  $('div.card-wrap .m-text-box').each((i, el) => {
    const text = $(el).text();
    const match = text.match(/#(.+?)#.*?播放指数([\d.]+)/);
    if (match) {
      items.push({
        id: `vlinkage_${i+1}`,
        type: "item",
        title: match[1],
        rating: parseFloat(match[2]),
        description: `播放指数 ${match[2]}`,
        link: $(el).find('a[href*="/status/"]').attr('href'),
      });
    }
  });
  return items;
}

export default { WidgetMetadata, modules: { getRank } };
