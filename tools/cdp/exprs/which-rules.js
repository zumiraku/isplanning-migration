(function () {
  var el = document.querySelector(".btnBack a");
  if (!el) { return { found: false }; }
  var hits = [];
  for (var i = 0; i < document.styleSheets.length; i++) {
    var ss = document.styleSheets[i], rules;
    try { rules = ss.cssRules; } catch (e) { hits.push("(読めないCSS " + (ss.href || "inline") + ")"); continue; }
    if (!rules) { continue; }
    (function walk(list, media) {
      for (var j = 0; j < list.length; j++) {
        var r = list[j];
        if (r.media && r.cssRules) { walk(r.cssRules, r.conditionText || String(r.media.mediaText)); continue; }
        if (!r.selectorText) { continue; }
        var sel = r.selectorText;
        var match = false;
        try { match = el.matches(sel); } catch (e) { }
        if (!match) { continue; }
        if (r.style && (r.style.background || r.style.backgroundImage)) {
          hits.push((media ? "@media " + media + "  " : "") + sel + "  →  " +
            (r.style.background || r.style.backgroundImage).slice(0, 70));
        }
      }
    })(rules, "");
  }
  return {
    found: true,
    背景: getComputedStyle(el).backgroundImage.slice(0, 80),
    幅: Math.round(el.getBoundingClientRect().width),
    画面: document.documentElement.clientWidth,
    当たっている規則: hits.slice(0, 10),
    シート数: document.styleSheets.length
  };
})()
