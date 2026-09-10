(function () {
  var doc = document.documentElement;
  var view = doc.clientWidth;
  function clipped(e) {
    var n = e.parentElement;
    while (n && n !== doc) {
      if (getComputedStyle(n).overflowX !== "visible") { return true; }
      n = n.parentElement;
    }
    return false;
  }
  function name(e) {
    if (!e) { return ""; }
    return e.tagName + (e.id ? "#" + e.id : "") +
      (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/)[0] : "");
  }
  var out = { 画面: view, 横: doc.scrollWidth, 一覧: [] };
  Array.prototype.slice.call(document.querySelectorAll("body *")).forEach(function (e) {
    var r = e.getBoundingClientRect();
    if (r.width <= 0 || r.right <= view + 2 || clipped(e)) { return; }
    var p = e.parentElement;
    /* 親もはみ出しているなら、名指しするのは親のほうです */
    if (p && p.getBoundingClientRect().right > view + 2 && !clipped(p)) { return; }
    var cs = getComputedStyle(e);
    out.一覧.push({
      どこ: name(e),
      右: Math.round(r.right),
      幅: Math.round(r.width),
      指定: cs.width + " / min " + cs.minWidth + " / " + cs.whiteSpace + " / " + cs.display + " / float " + cs.cssFloat,
      親: name(p),
      html: (e.outerHTML || "").replace(/\s+/g, " ").slice(0, 160)
    });
  });
  out.件数 = out.一覧.length;
  out.一覧 = out.一覧.slice(0, 8);
  return out;
})()
