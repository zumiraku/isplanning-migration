(function () {
  function n(s) { return document.querySelectorAll(s).length; }
  function items(sel) {
    var r = document.querySelector(sel);
    return r ? r.querySelectorAll('a[href*="/shopdetail/"], a[href*="/view/item/"]').length : -1;
  }
  var heads = Array.prototype.map.call(document.querySelectorAll(".M_mainContents h2, .M_mainContents h3"),
    function (h) { return (h.innerText || "").replace(/\s+/g, "").slice(0, 22); });
  return {
    見出し: heads,
    ランキング: n("li.rankList"),
    新着: items("#M_new, .M_new, #new_item"),
    おすすめ: items("#M_recommend, .M_recommend, #recommend_item"),
    最近チェック: items("#M_recent, #middle_recent, .recentBox"),
    スライダー: n("#M_slider li"),
    メインバナー: n("ul.O_mainBnr img"),
    商品リンク合計: n('a[href*="/shopdetail/"], a[href*="/view/item/"]')
  };
})()
