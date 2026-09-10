(function () {
  /* 「税込」を含む要素が、どの区画に属しているかを数えます */
  var marks = [
    ["#r_new", "新着商品"],
    ["#r_recommend", "おすすめ商品"],
    ["#r_ranking", "ランキング"],
    ["#r_recent", "最近見た商品"],
    ["#r_recommend_ct", "カテゴリのおすすめ"],
    [".rcmdjp-carousel", "レコメンド（外部）"],
    ["#colum-wrap", "フッターのコラム"],
    ["#M_leftContents", "左メニュー"],
    ["#O_itemDetail", "商品詳細の本文"],
    [".tab-area", "タブ"]
  ];
  var out = { total: 0, zones: {}, outside: 0 };
  var all = Array.prototype.slice.call(document.querySelectorAll("*"));
  all.forEach(function (e) {
    if (e.children.length) { return; }              /* 末端だけ数えます */
    var t = e.textContent || "";
    if (t.indexOf("税込") < 0) { return; }
    out.total++;
    var found = null;
    for (var i = 0; i < marks.length; i++) {
      var box = document.querySelector(marks[i][0]);
      if (box && box.contains(e)) { found = marks[i][1]; break; }
    }
    if (found) { out.zones[found] = (out.zones[found] || 0) + 1; }
    else { out.outside++; }
  });
  return out;
})()
