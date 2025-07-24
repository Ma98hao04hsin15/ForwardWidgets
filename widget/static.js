var WidgetMetadata = {
  id: "staticExample",
  title: "静态示例模块",
  description: "这是一个静态内容的 ForwardWidget 模块",
  author: "Your Name",                  
  site: "https://example.com",            
  version: "1.0.0",                       
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "静态内容展示",
      functionName: "getStaticContent",
      params: [] // 不需要参数，因为数据是静态的
    }
  ]
};

async function getStaticContent() {
  // 静态数据内容
  const staticData = [
    {
      title: "天作之合",
      year: 2025,
      description: "達珂塔強生飾演在紐約打拼，充滿抱負的年輕戀愛顧問露西，想不到戰無不勝的她，在一場婚禮遇到了業界傳說中的「獨角獸」，眾人幻想中的黃金單身漢，擁有名車和一千兩百萬美金的豪宅，幽默風趣又有品味，簡直完美。但是在命運的作弄下，仍在為五斗米折腰的前男友，卻在此時又闖進她的人生，「當我看著妳的臉，我看到皺紋和長得很像妳的小孩。」一直深愛她的前男友，讓露西開始重新思考人生的價值，愛情、婚姻、物質和現實。",
      poster: "vPW6UQW38ya1NrI6PuJOMzI0Nlp.jpg",
      tmdb_id: "1136867"
    },
    {
      title: "國家元首",
      year: 2025,
      description: "英國首相與美國總統之間的私人恩怨危及兩國關係。然而兩人被強大的敵人鎖定，被迫相依為命，踏上瘋狂的跨國逃亡之旅。在軍情六處菁英幹員諾兒的幫助下，兩國元首必須設法打擊威脅自由世界的巨大陰謀。",
      poster: "/gsp6imDEkBtJV0BZ1HMdEcG9UH7.jpg",
      tmdb_id: "749170"
    },
    // 更多静态数据项
  ];

  return staticData.map(movie => ({
    id: `movie_${movie.tmdb_id}`,
    type: "link",
    title: movie.title,
    description: movie.description,
    image: movie.poster,
    extra: {
      tmdb_id: movie.tmdb_id
    }
  }));
}
