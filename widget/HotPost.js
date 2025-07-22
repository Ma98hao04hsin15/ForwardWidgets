var WidgetMetadata = {
    "id": "dcard_hot",
  "title": "Dcard 熱門文章",
  "description": "抓取 Dcard 熱門文章列表",
  "author": "你的名字",
  "version": "1.0.0",
  "modules": [
    {
      "name": "熱門文章",
      "function": "hotPosts",
      "parameters": []
    }
  ]
};

async function hotPosts() {
  const res = await Widget.http.get("https://www.dcard.tw/service/api/v2/posts?popular=true&limit=10")
  const data = res.data

  return data.map(post => ({
    id: String(post.id),
    title: post.title,
    description: post.excerpt,
    posterPath: post.mediaMeta?.[0]?.url || "",
    videoUrl: `https://www.dcard.tw/f/${post.forumAlias}/p/${post.id}`,
    releaseDate: post.createdAt,
    mediaType: "article"
  }))
}
