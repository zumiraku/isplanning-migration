(function () {
  var a = document.querySelector("#menu-tag-reference");
  var out = { found: !!a };
  if (a) {
    out.outer = a.outerHTML.slice(0, 300);
    try {
      var ev = window.jQuery && window.jQuery._data ? window.jQuery._data(a, "events") : null;
      if (ev && ev.click) { out.click = ev.click.map(function (h) { return String(h.handler).slice(0, 500); }).join(" | "); }
    } catch (e) { out.click = "(読めません)"; }
  }
  /* 画面のどこかに参照用の枠が隠れていないか */
  out.dialogs = Array.from(document.querySelectorAll("[id*=reference], [class*=reference], [id*=tag], dialog, .modal"))
    .slice(0, 12).map(function (e) { return e.tagName + "#" + e.id + "." + e.className; });
  out.iframes = Array.from(document.querySelectorAll("iframe")).map(function (f) { return f.src; });
  return out;
})()
