(function () {
  function look(id) {
    var t = document.querySelector(id);
    if (!t) { return "(無し)"; }
    var h = t.innerHTML;
    var bits = [];
    if (t.querySelector("#recent")) { bits.push("最近チェック(" + t.querySelectorAll("#recent td.itemBox").length + "件)"); }
    if (h.indexOf("_rcmdjp") >= 0) { bits.push("イーレコメンド"); }
    if (t.querySelector("#M_group")) { bits.push("商品グループ(" + t.querySelectorAll("#M_group td.itemBox").length + "件)"); }
    if (t.querySelector(".page_scene")) { bits.push("カテゴリ画像(" + t.querySelectorAll(".page_scene li").length + "件)"); }
    if (t.querySelector(".review-container")) { bits.push("レビューウィジェット"); }
    if (t.querySelector("div.Review")) { bits.push("純正レビュー枠"); }
    if (t.querySelector(".detail_postage")) { bits.push("送料の注意書き"); }
    if (t.querySelector("#middle_recent")) { bits.push("#middle_recent"); }
    return bits.length ? bits.join(" ＋ ") : "(中身の目印なし)";
  }
  var labels = Array.prototype.map.call(document.querySelectorAll(".tab-list"),
    function (e) { return (e.innerText || "").replace(/\s+/g, ""); });
  return {
    tab1ラベル: labels[0] || "", tab1: look("#tab-content1"),
    tab2ラベル: labels[1] || "", tab2: look("#tab-content2"),
    tab3ラベル: labels[2] || "", tab3: look("#tab-content3"),
    id重複: (function () {
      var seen = {}, dup = [];
      Array.prototype.forEach.call(document.querySelectorAll("[id]"), function (e) {
        if (seen[e.id]) { if (dup.indexOf(e.id) < 0) { dup.push(e.id); } } else { seen[e.id] = 1; }
      });
      return dup.join(" ") || "無し";
    })()
  };
})()
