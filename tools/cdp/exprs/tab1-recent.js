(function () {
  var t = document.querySelector("#tab-content1");
  if (!t) { return { found: false }; }
  var r = t.querySelector("#middle_recent");
  var out = {
    found: true,
    tab1Text: (t.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160),
    middleRecent: !!r,
    rcmdInTab1: t.innerHTML.indexOf("_rcmdjp") >= 0,
    groupInTab1: !!t.querySelector("#M_group"),
    blocks: Array.prototype.map.call(t.children, function (c) {
      return c.tagName + (c.id ? "#" + c.id : "") +
        (typeof c.className === "string" && c.className ? "." + c.className.trim().split(/\s+/).join(".") : "");
    })
  };
  if (r) {
    out.recentHtml = (r.innerHTML || "").replace(/\s+/g, " ").trim().slice(0, 2600);
    out.recentItems = r.querySelectorAll("a[href*='shopdetail'], a[href*='/view/item/']").length;
  }
  return out;
})()
