const WidgetMetadata = {
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
 * 使用正則解析 IMDb TV Meter 頁面 HTML，取出節目清單
 */
async function loadIMDbTVMeter(params) {
  const yearFilter = params?.year?.trim();
  const url = "https://www.imdb.com/chart/tvmeter/";

  const res = await fetch(url);
  if (!res.ok) throw new Error("無法取得 IMDb TV Meter 頁面");
  const html = await res.text();

  // 找到 tbody.lister-list 裡的所有 <tr>，用正則抓出節目信息
  // 一個 tr 範例大致包含：
  // <tr>...<td class="posterColumn"><a href="/title/tt1234567/"> <img src="..."></a></td>
  // <td class="titleColumn">
  //   1.
  //   <a href="/title/tt1234567/">節目名稱</a>
  //   <span class="secondaryInfo">(2023)</span>
  // </td>
  // <td class="imdbRating"><strong title="7.5 based on 12345 user ratings">7.5</strong></td>
  // </tr>

  // 先用正則匹配所有 <tr>...</tr>
  const trRegex = /<tr>([\s\S]*?)<\/tr>/g;
  let match;
  const items = [];

  while ((match = trRegex.exec(html)) !== null) {
    const trHtml = match[1];

    // 用正則抽取 IMDb ID
    const imdbIdMatch = trHtml.match(/href="\/title\/(tt\d+)\//);
    const imdbId = imdbIdMatch ? imdbIdMatch[1] : null;
    if (!imdbId) continue; // 沒ID跳過

    // 抽出標題
    const titleMatch = trHtml.match(/<a href="\/title\/tt\d+\/"[^>]*>([^<]+)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // 抽出年份
    const yearMatch = trHtml.match(/<span class="secondaryInfo">\((\d{4})\)<\/span>/);
    const year = yearMatch ? yearMatch[1] : "";

    // 抽出評分
    const ratingMatch = trHtml.match(/<td class="imdbRating">[\s\S]*?<strong[^>]*>([\d.]+)<\/strong>/);
    const rating = ratingMatch ? ratingMatch[1] : null;

    // 抽出海報 URL
    const posterMatch = trHtml.match(/<td class="posterColumn">[\s\S]*?<img[^>]+src="([^"]+)"/);
    const poster = posterMatch ? posterMatch[1] : null;

    // 年份篩選
    if (yearFilter && year !== yearFilter) continue;

    items.push({
      imdbId,
      title,
      year,
      rating,
      poster,
    });
  }

  return { data: items };
}

export { WidgetMetadata, loadIMDbTVMeter };
