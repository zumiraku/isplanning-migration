(function () {
  return {
    タイトル: document.title,
    URL: location.pathname + location.search.slice(0, 40),
    見出し: (function () { var h = document.querySelector("h1,h2.main-ttl,h2"); return h ? (h.innerText || "").replace(/\s+/g, "").slice(0, 40) : "(無し)"; })(),
    画像の数: document.querySelectorAll("img").length,
    CSSの数: document.querySelectorAll('link[rel="stylesheet"]').length
  };
})()
