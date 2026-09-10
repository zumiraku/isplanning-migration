(function () {
  var r = document.querySelector("#r_recommend_ct");
  if (!r) { return { found: false }; }
  var srcs = {};
  Array.prototype.forEach.call(r.querySelectorAll("img"), function (i) {
    var u = (i.currentSrc || i.src || "").split("/").pop().split("?")[0];
    srcs[u] = (srcs[u] || 0) + 1;
  });
  return {
    found: true,
    画像の数: r.querySelectorAll("img").length,
    リンクの数: r.querySelectorAll("a").length,
    画像の内訳: Object.entries(srcs).sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, 12).map(function (e) { return e[1] + "  " + e[0]; }),
    文字: (r.innerText || "").replace(/\s+/g, " ").trim().slice(0, 300)
  };
})()
