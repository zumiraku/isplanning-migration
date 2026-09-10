(function () {
  var REGIONS = [
    ["ヘッダー", "#header, #headerWrap"],
    ["左メニュー", "#O_sideMenu, #M_leftContents"],
    ["フッター", "#footerWrap, #footer_guideWrap"]
  ];
  var out = {};
  REGIONS.forEach(function (pair) {
    var name = pair[0], sel = pair[1];
    var root = null;
    sel.split(",").forEach(function (s) { if (!root) { root = document.querySelector(s.trim()); } });
    if (!root) { out[name] = null; return; }
    var seen = {}, list = [];
    Array.prototype.forEach.call(root.querySelectorAll("a[href]"), function (a) {
      var href = a.getAttribute("href") || "";
      var text = (a.textContent || "").replace(/\s+/g, "");
      if (!text) {
        var img = a.querySelector("img");
        text = img ? "[画像]" + (img.getAttribute("alt") || "") : "[文字なし]";
      }
      var key = href + " ⟨" + text.slice(0, 30) + "⟩";
      if (seen[key]) { return; }
      seen[key] = 1;
      list.push(key);
    });
    out[name] = list;
  });
  return out;
})()
