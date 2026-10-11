(function () {
  function short(u) { return String(u || "").replace(/^https?:\/\/[^/]+/, ""); }
  var imgs = Array.prototype.slice.call(document.querySelectorAll("img"));
  var broken = [], loaded = 0, pending = 0;
  imgs.forEach(function (i) {
    if (!i.getAttribute("src")) { return; }
    if (i.complete && i.naturalWidth > 0) { loaded++; return; }
    if (!i.complete) { pending++; return; }
    broken.push(short(i.currentSrc || i.src) + "  ⟨" + (i.getAttribute("alt") || "") + "⟩");
  });

  var bg = {};
  Array.prototype.forEach.call(document.querySelectorAll("body *"), function (e) {
    var v = getComputedStyle(e).backgroundImage;
    if (!v || v === "none") { return; }
    (v.match(/url\((['"]?)([^'")]+)\1\)/g) || []).forEach(function (m) {
      var u = m.replace(/^url\((['"]?)/, "").replace(/(['"]?)\)$/, "");
      if (u.indexOf("data:") === 0) { return; }
      bg[short(u)] = 1;
    });
  });

  var css = [], cssBad = [];
  Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) {
    css.push(short(l.href));
    if (!l.sheet) { cssBad.push(short(l.href)); }
  });

  var js = [];
  Array.prototype.forEach.call(document.querySelectorAll("script[src]"), function (s) { js.push(short(s.src)); });

  return {
    画像の数: imgs.length,
    出た画像: loaded,
    まだ読込中: pending,
    出ていない画像: broken,
    背景画像: Object.keys(bg).sort(),
    CSSの数: css.length,
    読めないCSS: cssBad,
    JSの数: js.length,
    JS一覧: js.sort()
  };
})()
