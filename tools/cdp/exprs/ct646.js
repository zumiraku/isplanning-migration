(function () {
  function look(id) {
    var t = document.querySelector(id);
    if (!t) { return "(枠が無い)"; }
    var h = t.innerHTML, bits = [];
    if (t.querySelector("#recent")) { bits.push("最近チェック(" + t.querySelectorAll("#recent p.name").length + ")"); }
    if (h.indexOf("_rcmdjp") >= 0) { bits.push("イーレコメンド"); }
    if (t.querySelector("#M_group")) { bits.push("商品グループ(" + t.querySelectorAll("#M_group p.name").length + ")"); }
    if (t.querySelector(".page_scene")) { bits.push("カテゴリ画像(" + t.querySelectorAll(".page_scene li").length + ")"); }
    if (t.querySelector(".review-container")) { bits.push("レビューウィジェット"); }
    if (t.querySelector("div.Review")) { bits.push("純正レビュー枠"); }
    if (t.querySelector(".detail_postage")) { bits.push("送料の注意書き"); }
    return bits.length ? bits.join(" ＋ ") : "(目印なし)";
  }
  var g = document.querySelector("#M_group");
  var labels = Array.prototype.map.call(document.querySelectorAll(".tab-list"),
    function (e) { return (e.innerText || "").replace(/\s+/g, ""); });
  return {
    タブ名: labels.join(" ｜ "),
    tab1: look("#tab-content1"),
    tab2: look("#tab-content2"),
    tab3: look("#tab-content3"),
    グループ見出し: g && g.previousElementSibling ? (g.previousElementSibling.innerText || "").replace(/\s+/g, "") : "(無し)",
    グループ件数: g ? g.querySelectorAll("p.name").length : 0,
    グループ先頭3: g ? Array.prototype.slice.call(g.querySelectorAll("p.name"), 0, 3)
      .map(function (p) { return (p.innerText || "").replace(/\s+/g, "").slice(0, 24); }) : [],
    画像枠: document.querySelector("#Item_detail_Image") ? "#Item_detail_Image" :
            (document.querySelector("#itemImg") ? "#itemImg" : "(無し)"),
    サムネイル数: document.querySelectorAll(".M_imageThumbnail-item").length,
    画像枠の中のimg: document.querySelectorAll("#itemImg img, #Item_detail_Image img").length,
    Other_imgの中のimg: document.querySelectorAll("#Other_img img").length
  };
})()
