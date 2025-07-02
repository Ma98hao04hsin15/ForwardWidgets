WidgetMetadata ={
  "id": "daily.tvshows",
  "title": "每日追劇日曆",
  "version": "1.0.0",
  "requiredVersion": "0.0.1",
  "description": "每日更新今日播出的電視劇集，支援依平台與地區篩選，無需 API Key",
  "author": "Forward",
  "site": "https://www.themoviedb.org/",
  "modules": [
    {
      "title": "每日追劇清單",
      "functionName": "loadTodayAiringWithPlatform",
      "cacheDuration": 3600,
      "params": [
        {
          "name": "region",
          "title": "地區",
          "type": "select",
          "default": "TW",
          "options": [
            { "title": "台灣", "value": "TW" },
            { "title": "美國", "value": "US" },
            { "title": "日本", "value": "JP" },
            { "title": "韓國", "value": "KR" }
          ]
        },
        {
          "name": "platform_filter",
          "title": "播放平台篩選",
          "type": "select",
          "default": "",
          "options": [
            { "title": "全部", "value": "" },
            { "title": "Netflix", "value": "Netflix" },
            { "title": "Disney+", "value": "Disney+" },
            { "title": "HBO", "value": "HBO" },
            { "title": "HBO Max", "value": "HBO Max" },
            { "title": "Amazon Prime", "value": "Amazon" },
            { "title": "Apple TV+", "value": "Apple TV+" },
            { "title": "Hulu", "value": "Hulu" },
            { "title": "Paramount+", "value": "Paramount+" },
            { "title": "Peacock", "value": "Peacock" },
            { "title": "tvN", "value": "tvN" },
            { "title": "KBS2", "value": "KBS2" },
            { "title": "MBC", "value": "MBC" },
            { "title": "SBS", "value": "SBS" },
            { "title": "JTBC", "value": "JTBC" },
            { "title": "ENA", "value": "ENA" },
            { "title": "Tokyo MX", "value": "Tokyo MX" },
            { "title": "TBS", "value": "TBS" },
            { "title": "NHK", "value": "NHK" },
            { "title": "WOWOW", "value": "WOWOW" },
            { "title": "BS朝日", "value": "BS朝日" },
            { "title": "KKTV", "value": "KKTV" },
            { "title": "friDay影音", "value": "friDay" },
            { "title": "iQIYI", "value": "iQIYI" },
            { "title": "WeTV", "value": "WeTV" },
            { "title": "Mango TV", "value": "Mango TV" },
            { "title": "Tencent Video", "value": "Tencent Video" }
          ]
        }
      ]
    }
  ]
}
// === 主函數：載入今日播出資料 ===
async function loadTodayAiringWithPlatform({ region = "TW", platform_filter = "" }) {
  const url = `https://www.themoviedb.org/tv/on-the-air?region=${region}`;
  const html = await (await fetch(url)).text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [];
  const cards = [...doc.querySelectorAll(".card.style_1")];

  for (const card of cards) {
    const title = card.querySelector(".title a")?.textContent?.trim();
    const href = card.querySelector(".title a")?.getAttribute("href");
    const id = href?.split("/")[2];
    const poster = card.querySelector(".image_content img")?.getAttribute("data-src") || "";
    const airDateText = card.querySelector(".air_date")?.textContent?.trim() || "";
    const networks = [...card.querySelectorAll(".network")]
      .map((el) => el.getAttribute("title"))
      .filter(Boolean);

    // 平台篩選（模糊比對）
    if (platform_filter) {
      const matches = networks.some((n) =>
        n.toLowerCase().includes(platform_filter.toLowerCase())
      );
      if (!matches) continue;
    }

    items.push({
      title,
      subtitle: `${airDateText}｜${networks.join(", ")}`,
      picture: poster,
      link: `https://www.themoviedb.org${href}`,
      id,
    });
  }

  return items;
}
