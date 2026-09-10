(function () {
  function n(s) { return document.querySelectorAll(s).length; }
  function flat(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  var rec = document.querySelector("#r_recommend_ct");
  var names = rec ? Array.prototype.map.call(rec.querySelectorAll("p.item-name"), function (e) {
    return flat(e.innerText).slice(0, 24);
  }) : [];
  var recImgAlt = rec ? Array.prototype.map.call(rec.querySelectorAll("img"), function (e) {
    return (e.getAttribute("alt") || "(alt無し)").slice(0, 24);
  }) : [];
  var pager = document.querySelector("#pager, .M_pager, ul.pagenavi");
  return {
    商品の数: n("td.itemtext"),
    全件表示: (function () { var t = document.querySelector("p.total"); return t ? flat(t.innerText) : "(無し)"; })(),
    ページ送りのリンク: n("#pager a, .M_pager a, .pager a, ul.pagenavi a"),
    ページ送りの文字: pager ? flat(pager.innerText).slice(0, 120) : "(枠なし)",
    おすすめ枠の画像: rec ? rec.querySelectorAll("img").length : -1,
    おすすめ枠の名前: names.slice(0, 8),
    おすすめ枠のalt: recImgAlt.slice(0, 12),
    カテゴリバナー: n("ul.categotybanner img"),
    見出し: Array.prototype.map.call(document.querySelectorAll(".M_mainContents h2, .M_mainContents h3"), function (h) {
      return flat(h.innerText).slice(0, 26);
    }).slice(0, 10)
  };
})()
