(function () {
  var doc = document.documentElement;
  var out = { before: { scrollW: doc.scrollWidth, innerWidth: window.innerWidth, clientWidth: doc.clientWidth } };

  /* ① ヘッダーを消して測り直します */
  var h = document.querySelector("#headerWrap");
  if (h) {
    h.style.display = "none";
    out.withoutHeader = { scrollW: doc.scrollWidth, innerWidth: window.innerWidth };
    h.style.display = "";
  }

  /* ② ヘッダーの中の並びを折り返させて測り直します */
  var inner = document.querySelector(".h-txt-inner");
  if (inner) {
    var save = inner.style.cssText;
    inner.style.flexWrap = "wrap";
    inner.style.maxWidth = "100%";
    out.withWrap = { scrollW: doc.scrollWidth, innerWidth: window.innerWidth,
                     header: Math.round(document.querySelector("#headerWrap").getBoundingClientRect().width) };
    inner.style.cssText = save;
  }

  /* ③ ヘッダー以外で、375 より右へ出ている要素 */
  var wide = [];
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    if (h && (e === h || h.contains(e))) { return; }
    var r = e.getBoundingClientRect();
    if (r.width > 0 && r.right > 377) {
      wide.push((e.tagName + (e.id ? "#" + e.id : "") +
        (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/[\t ]+/)[0] : "")) +
        "  右" + Math.round(r.right) + " 幅" + Math.round(r.width));
    }
  });
  out.wideOthers = wide.slice(0, 12);
  out.wideOthersCount = wide.length;
  return out;
})()
