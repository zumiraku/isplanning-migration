(function () {
  /* 番号で当てない: チェックボックスの順は再描画で変わる */
  var WANT = ["商品特定コード指定", "システム商品コード", "画像説明文2", "画像説明文3",
              "スマホ商品説明2", "PC用追加商品説明文"];

  var cancel = Array.from(document.querySelectorAll("button")).filter(function (b) {
    return (b.innerText || "").replace(/\s+/g, "") === "キャンセル";
  })[0];
  if (cancel) { cancel.click(); }

  var rows = [];
  Array.from(document.querySelectorAll('input[type="checkbox"]')).forEach(function (cb) {
    var box = cb, label = "";
    for (var k = 0; k < 8 && box.parentElement; k++) {
      box = box.parentElement;
      var t = (box.innerText || "").replace(/\s+/g, " ").trim();
      if (t && t.replace(/表示|非表示|※[^ ]*/g, "").trim().length > 1) { label = t; break; }
    }
    rows.push({ cb: cb, label: label });
  });

  var report = [];
  rows.forEach(function (r) {
    var name = r.label.split("\n")[0].replace(/※.*$/, "").replace(/表示|非表示/g, "").trim();
    var want = WANT.some(function (w) { return name.indexOf(w) === 0; });
    if (r.cb.checked !== want) { r.cb.click(); }
    if (want) { report.push(name + " : " + (r.cb.checked ? "表示" : "※ 外れたまま")); }
  });

  var on = rows.filter(function (r) { return r.cb.checked; })
               .map(function (r) { return r.label.split("\n")[0].replace(/※.*$/, "").trim(); });
  return { 指定したもの: report, いま表示になっているもの: on };
})()
