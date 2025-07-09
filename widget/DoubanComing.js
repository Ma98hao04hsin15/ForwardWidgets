const WidgetMetadata = {
  id: "douban.coming.beijing",
  title: "豆瓣 - 北京即將上映",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "顯示豆瓣電影中北京即將上映的電影資訊",
  author: "Forward",
  homepage: "https://movie.douban.com/cinema/later/beijing/",
  modules: [
    {
      title: "即將上映",
      functionName: "loadComingSoon",
      requiresWebView: false
    }
  ]
};

async function loadComingSoon() {
  const html = await fetchText("https://movie.douban.com/cinema/later/beijing/");
  const doc = htmlToDoc(html);
  const items = [];

  const movieItems = doc.querySelectorAll(".coming_list .item");
  for (const el of movieItems) {
    const title = el.querySelector("h3 a")?.textContent.trim() ?? "";
    const date = el.querySelector("li.date")?.textContent.trim() ?? "";
    const poster = el.querySelector("img")?.getAttribute("src") ?? "";
    const rating = el.querySelector(".rating span")?.textContent.trim() ?? "暫無評分";
    const intro = Array.from(el.querySelectorAll("li"))
      .map(li => li.textContent.trim())
      .filter(line => !line.startsWith("上映"))
      .join(" / ");

    items.push({
      title: `${title}（${date}）`,
      description: `${intro}\n評分：${rating}`,
      pic: poster,
      url: el.querySelector("h3 a")?.getAttribute("href") ?? ""
    });
  }

  return items;
}
