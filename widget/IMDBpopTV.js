WidgetMetadata = {
  id: "IMDbInterestByRegion",
  title: "IMDb Interest 清單依地區篩選",
  modules: [
    {
      title: "依地區篩選 IMDb Interest 清單",
      requiresWebView: false,
      functionName: "loadInterestByRegion",
      cacheDuration: 3600,
      params: [
        {
          name: "interest_url",
          title: "IMDb Interest List URL",
          type: "input",
          description:
            "輸入 IMDb Interest List 的完整網址，例如：https://www.imdb.com/interest/in0000209/",
          required: true,
        },
        {
          name: "region",
          title: "地區篩選 (Country)",
          type: "select",
          description: "請選擇想篩選的影片製作國家",
          required: false,
          options: [
            { title: "不限", value: "" },
            { title: "美國 (US)", value: "US" },
            { title: "日本 (JP)", value: "JP" },
            { title: "韓國 (KR)", value: "KR" },
            { title: "英國 (GB)", value: "GB" },
            { title: "加拿大 (CA)", value: "CA" },
            { title: "中國 (CN)", value: "CN" },
            { title: "法國 (FR)", value: "FR" },
            { title: "德國 (DE)", value: "DE" },
            { title: "澳洲 (AU)", value: "AU" },
            // 你可以繼續補充
          ],
        },
      ],
    },
  ],
};

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "Accept-Language": "en-US,en" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

async function parseInterestList(html) {
  const regex = /\/title\/(tt\d{7,8})\//g;
  const ids = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) {
    ids.add(m[1]);
  }
  return Array.from(ids);
}

async function fetchTitleRegion(imdbId) {
  const url = `https://www.imdb.com/title/${imdbId}/`;
  const html = await fetchHtml(url);
  const regionRegex = /\/search\/title\?country_of_origin=([A-Z]{2})"/g;
  const regions = new Set();
  let m;
  while ((m = regionRegex.exec(html)) !== null) {
    regions.add(m[1]);
  }
  return Array.from(regions);
}

async function loadInterestByRegion(params) {
  const { interest_url, region } = params;
  if (!interest_url) throw new Error("請輸入 Interest List URL");

  const html = await fetchHtml(interest_url);
  const imdbIds = await parseInterestList(html);

  const results = [];
  const limit = 30;
  for (let i = 0; i < Math.min(imdbIds.length, limit); i++) {
    const id = imdbIds[i];
    try {
      const regions = await fetchTitleRegion(id);
      if (!region || regions.includes(region.toUpperCase())) {
        results.push({
          id,
          regions,
          url: `https://www.imdb.com/title/${id}/`,
        });
      }
    } catch (e) {
      console.warn(`抓取影片 ${id} 地區失敗:`, e.message);
    }
  }

  return results;
}

export { WidgetMetadata, loadInterestByRegion };
