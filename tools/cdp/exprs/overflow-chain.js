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
  function line(n) {
    var cs = getComputedStyle(n);
    var r = n.getBoundingClientRect();
    return (n.tagName + (n.id ? "#" + n.id : "") +
      (typeof n.className === "string" && n.className ? "." + n.className.trim().split(/[\t ]+/)[0] : "")) +
      "  幅" + Math.round(r.width) + " 左" + Math.round(r.left) + " 右" + Math.round(r.right) +
      " css幅 " + cs.width + " maxW " + cs.maxWidth + " display " + cs.display +
      " white-space " + cs.whiteSpace + " float " + cs.cssFloat + " overflowX " + cs.overflowX +
      (n.getAttribute && n.getAttribute("width") ? " 属性width=" + n.getAttribute("width") : "");
  }
  var out = { view: view, innerWidth: window.innerWidth, scrollW: doc.scrollWidth, offenders: [] };
  var seen = 0;
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    if (seen >= 3) { return; }
    var r = e.getBoundingClientRect();
    if (r.width <= 0 || r.right <= view + 2 || clipped(e)) { return; }
    /* 親も同じだけはみ出していたら親が元。子は飛ばす */
    var p = e.parentElement;
    if (p && p.getBoundingClientRect().right > view + 2 && !clipped(p)) { return; }
    seen++;
    var chain = [];
    var n = e;
    while (n && n.nodeType === 1 && chain.length < 10) { chain.push(line(n)); n = n.parentElement; }
    out.offenders.push({
      text: (e.innerText || "").replace(/[\r\n\t ]+/g, " ").trim().slice(0, 60),
      html: (e.outerHTML || "").replace(/[\r\n\t ]+/g, " ").slice(0, 200),
      chain: chain
    });
  });
  return out;
})()
