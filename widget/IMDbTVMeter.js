WidgetMetadata = {
  id: "IMDbTVMeter",
  title: "IMDb 熱門電視排行榜",
  description: "從 IMDb TV Meter 頁面抓取熱門電視節目，無需 API Key",
  requiresWebView: false,
  cacheDuration: 3600,
  params: [
    {
      name: "year",
      title: "年份篩選",
      type: "input",
      placeholder: "輸入年份 (選填)",
      description: "僅顯示該年份的節目"
    }
  ]
};

// 主函式：取得並解析熱門電視榜
async function loadIMDbTVMeter(params) {
  const yearFilter = params?.year?.trim();

  const url = "https://www.imdb.com/chart/tvmeter/";

  const res = await fetch(url);
  if (!res.ok) throw new Error("無法取得 IMDb TV Meter 頁面");

  const html = await res.text();

  // 用 DOMParser 解析 HTML （若環境無 DOMParser 可用正規表達式簡易解析）
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 篩選熱門節目列表
  const rows = [...doc.querySelectorAll(".lister-list tr")];

  let items = rows.map(row => {
    const linkElem = row.querySelector("td.titleColumn a");
    const title = linkElem?.textContent?.trim() ?? "";
    const href = linkElem?.getAttribute("href") ?? "";
    // href 格式: /title/tt1234567/
    const imdbIdMatch = href.match(/\/title\/(tt\d+)\//);
    const imdbId = imdbIdMatch ? imdbIdMatch[1] : null;

    const yearElem = row.querySelector("td.titleColumn span.secondaryInfo");
    // 格式: (2023)
    let year = yearElem?.textContent?.replace(/[()]/g, "") ?? "";

    const ratingElem = row.querySelector("td.imdbRating strong");
    const rating = ratingElem?.textContent ?? null;

    const posterElem = row.querySelector("td.posterColumn img");
    const poster = posterElem?.getAttribute("src") ?? null;

    return {
      imdbId,
      title,
      year,
      rating,
      poster,
    };
  });

  // 篩選年份（可選）
  if (yearFilter) {
    items = items.filter(i => i.year === yearFilter);
  }

  return {
    data: items,
  };
}

export { WidgetMetadata, loadIMDbTVMeter };
