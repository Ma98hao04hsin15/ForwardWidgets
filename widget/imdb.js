export const WidgetMetadata = {
  id: "forward.imdb",
  title: "IMDb 工具集",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "IMDb 榜單與放映日曆工具",
  author: "Forward",
  site: "https://www.imdb.com",
  modules: [
    {
      id: "imdb_calendar",
      title: "IMDb 上映日曆",
      functionName: "loadIMDbCalendar",
      cacheDuration: 3600,
      params: [
        {
          name: "region",
          type: "select",
          default: "US",
          options: [
            { label: "美國", value: "US" },
            { label: "英國", value: "GB" },
            { label: "加拿大", value: "CA" },
            { label: "日本", value: "JP" },
            { label: "韓國", value: "KR" },
            { label: "台灣", value: "TW" },
            { label: "法國", value: "FR" },
            { label: "德國", value: "DE" },
            { label: "印度", value: "IN" },
            { label: "澳洲", value: "AU" }
          ]
        }
      ]
    }
  ]
};
export async function loadIMDbCalendar({ region = "US" }) {
  const url = `https://www.imdb.com/calendar/?region=${region}`;
  const html = await fetch(url).then(res => res.text());

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const result = [];

  const releaseSections = doc.querySelectorAll("section.ipc-page-section");

  for (const section of releaseSections) {
    const date = section.querySelector("h3")?.textContent?.trim();

    const items = section.querySelectorAll("ul > li > a");

    for (const a of items) {
      const title = a.textContent?.trim();
      const href = a.getAttribute("href");
      const imdbIdMatch = href?.match(/\/title\/(tt\d+)/);
      if (imdbIdMatch) {
        result.push({
          title,
          date,
          imdb_id: imdbIdMatch[1]
        });
      }
    }
  }

  return result;
}
