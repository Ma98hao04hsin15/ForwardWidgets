WidgetMetadata = {
  id: "IMDbTVMeter",
  title: "IMDb 熱門電視排行榜",
  description: "從 IMDb TV Meter 頁面抓取熱門電視節目，無需 API Key，支持年份篩選",
  requiresWebView: false,
  cacheDuration: 3600,
  params: [
    {
      name: "year",
      title: "年份篩選",
      type: "input",
      placeholder: "輸入年份 (選填)",
      description: "只顯示指定年份的節目"
    }
  ]
};

/**
 * 取得並解析 IMDb TV Meter 頁面熱門電視節目
 * @param {Object} params - 參數物件
 * @param {string} params.year - 篩選年份（選填）
 * @returns {Promise<{data:Array}>} - 返回節目列表
 */
async function loadIMDbTVMeter(params) {
  const yearFilter = params?.year?.trim();

  const url = "https://www.imdb.com/chart/tvmeter/";

  const res = await fetch(url);
  if (!res.ok) throw new Error("無法取得 IMDb TV Meter 頁面");

  const html = await res.text();

  // 環境若支援 DOMParser 則用它解析
  let doc;
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, "text/html");
  } else {
    // 若無 DOMParser (例如 Node.js 環境) 可用簡單正則或其他套件替代，這裡不展開
    throw new Error("目前環境不支援 DOMParser，無法解析 HTML");
  }

  // 抓取熱門節目表格的所有列
  const rows = [...doc.querySelectorAll(".lister-list tr")];

  let items = rows.map(row => {
    const linkElem = row.querySelector("td.titleColumn a");
    const title = linkElem?.textContent?.trim() ?? "";
    const href = linkElem?.getAttribute("href") ?? "";
    // href 格式: /title/tt1234567/
    const imdbIdMatch = href.match(/\/title\/(tt\d+)\//);
    const imdbId = imdbIdMatch ? imdbIdMatch[1] : null;

    const yearElem = row.querySelector("td.titleColumn span.secondaryInfo");
    let year = yearElem?.textContent?.replace(/[()]/g, "") ?? "";

    const ratingElem = row.querySelector("td.imdbRating strong");
    const rating = ratingElem?.textContent ?? null;

    const posterElem = row.querySelector("td.posterColumn img");
    // 海報圖 URL 可能是縮圖，可視需求改為更高畫質 URL
    const poster = posterElem?.getAttribute("src") ?? null;

    return {
      imdbId,
      title,
      year,
      rating,
      poster,
    };
  });

  // 篩選年份（如果有設定）
  if (yearFilter) {
    items = items.filter(i => i.year === yearFilter);
  }

  return { data: items };
}

export { WidgetMetadata, loadIMDbTVMeter };
