(function () {
  var target = null;
  Array.from(document.querySelectorAll("a")).forEach(function (a) {
    if (!target && (a.innerText || "").indexOf("熱中症") >= 0) { target = a; }
  });
  if (!target) { return { err: "見つかりません" }; }
  var out = { view: document.documentElement.clientWidth, chain: [] };
  var n = target;
  while (n && n.nodeType === 1) {
    var cs = getComputedStyle(n);
    var r = n.getBoundingClientRect();
    out.chain.push(
      (n.tagName + (n.id ? "#" + n.id : "") +
        (typeof n.className === "string" && n.className ? "." + n.className.trim().split(/[\t ]+/)[0] : "")) +
      "  幅" + Math.round(r.width) + " 右" + Math.round(r.right) +
      " css幅 " + cs.width + " maxW " + cs.maxWidth +
      " display " + cs.display + " white-space " + cs.whiteSpace +
      " table-layout " + cs.tableLayout + " overflowX " + cs.overflowX);
    n = n.parentElement;
  }
  var f = document.querySelector("iframe");
  if (f) {
    out.iframe = "属性 width=" + (f.getAttribute("width") || "(なし)") +
      " / style=" + (f.getAttribute("style") || "(なし)") +
      " / 実幅 " + Math.round(f.getBoundingClientRect().width) +
      " / src " + (f.src || "").slice(0, 60);
  }
  return out;
})()
