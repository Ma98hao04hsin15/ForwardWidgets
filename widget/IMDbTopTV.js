export const WidgetMetadata = {
  id: "IMDbTopTV",
  title: "IMDb Top 250 電視節目",
  description: "從 IMDb Top 250 TV 榜單擷取資料，無需 API Key",
  icon: "🎬",
  modules: [
    {
      title: "IMDb Top TV 榜單",
      functionName: "loadIMDbTopTV",
      cacheDuration: 86400,
      requiresWebView: false,
      params: [],
    },
  ],
};

export async function loadIMDbTopTV() {
  const res = await fetch("https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250");
  const html = await res.text();
  const dom = new DOMParser().parseFromString(html, "text/html");

  const rows = Array.from(dom.querySelectorAll(".lister-list tr"));
  const items = rows.map((row, index) => {
    const anchor = row.querySelector("td.titleColumn a");
    const title = anchor?.textContent?.trim();
    const href = anchor?.getAttribute("href") || "";
    const imdbId = href.match(/\/title\/(tt\d+)/)?.[1] || "";
    const year = row.querySelector(".secondaryInfo")?.textContent?.replace(/[()]/g, "") || "";
    const rating = row.querySelector(".imdbRating strong")?.textContent || "";

    return {
      title,
      subtitle: `#${index + 1} ｜ ${year} ｜ IMDb ${rating}`,
      imdb_id: imdbId,
    };
  });

  return items;
}
