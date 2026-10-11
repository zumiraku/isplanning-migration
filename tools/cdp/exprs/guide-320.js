(function () {
  var doc = document.documentElement;
  var view = doc.clientWidth;
  var out = { view: view, wide: [] };
  Array.prototype.slice.call(document.querySelectorAll("li, a")).forEach(function (e) {
    var r = e.getBoundingClientRect();
    if (r.width <= 0 || r.right <= view + 2) { return; }
    var n = e.parentElement, clipped = false;
    while (n && n !== doc) {
      if (getComputedStyle(n).overflowX !== "visible") { clipped = true; break; }
      n = n.parentElement;
    }
    if (clipped) { return; }
    var cs = getComputedStyle(e);
    var par = e.parentElement;
    out.wide.push({
      tag: e.tagName + (e.id ? "#" + e.id : "") +
           (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/[\t ]+/)[0] : ""),
      right: Math.round(r.right),
      width: Math.round(r.width),
      cssWidth: cs.width,
      whiteSpace: cs.whiteSpace,
      display: cs.display,
      float: cs.cssFloat,
      parent: par ? (par.tagName + (typeof par.className === "string" && par.className
        ? "." + par.className.trim().split(/[\t ]+/)[0] : "")) : "",
      text: (e.innerText || "").replace(/[\s　]+/g, " ").trim().slice(0, 46)
    });
  });
  out.count = out.wide.length;
  out.wide = out.wide.slice(0, 8);
  return out;
})()
