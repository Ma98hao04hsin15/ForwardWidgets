export const WidgetMetadata = {
  id: "imdb.network.tv",
  title: "播放平台熱播影集",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  description: "從 IMDb 熱門榜單分析影集播放平台，依平台分類顯示熱播影集，無需 API Key，並附上平台 icon",
  author: "Forward",
  site: "https://www.imdb.com/chart/tvmeter",
  modules: [
    {
      title: "播放平台影集",
      functionName: "loadIMDbTVByNetwork",
      cacheDuration: 21600, // 6 小時快取
      params: [
        {
          name: "network",
          type: "select",
          default: "Netflix",
          options: ["Netflix", "HBO", "Disney+", "Apple TV+", "Amazon", "Hulu"]
        }
      ]
    }
  ]
};

export async function loadIMDbTVByNetwork({ network }) {
  const url = "https://www.imdb.com/chart/tvmeter/";
  const res = await fetch(url);
  const html = await res.text();

  const items = [...html.matchAll(/<a href="\/title\/(tt\d+)\/[^>]*>([^<]+)<\/a>/g)].map(match => {
    const id = match[1];
    const title = match[2];
    return { id, title };
  });

  const platformKeywords = {
    "Netflix": ["Netflix"],
    "HBO": ["HBO", "Max"],
    "Disney+": ["Disney"],
    "Apple TV+": ["Apple TV", "Apple"],
    "Amazon": ["Amazon", "Prime"],
    "Hulu": ["Hulu"]
  };

  const platformIcons = {
    "Netflix": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "HBO": "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
    "Disney+": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    "Apple TV+": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_TV_Plus_Logo.svg",
    "Amazon": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png",
    "Hulu": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg"
  };

  const keywords = platformKeywords[network] || [];
  const icon = platformIcons[network] || "";

  const filteredItems = [];

  for (let i = 0; i < Math.min(items.length, 30); i++) {
    const { id, title } = items[i];
    const detailUrl = `https://www.imdb.com/title/${id}/`;

    try {
      const detailRes = await fetch(detailUrl);
      const detailHtml = await detailRes.text();

      const matched = keywords.some(keyword => detailHtml.includes(keyword));
      if (matched) {
        filteredItems.push({
          title,
          subtitle: network,
          icon,
          imdb_id: id
        });
      }
    } catch (err) {
      // 忽略錯誤
    }
  }

  return filteredItems;
}

export default WidgetMetadata;
