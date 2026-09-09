(function () {
  var el = document.querySelector("#footer_guide");
  if (!el) { return "(#footer_guide がありません)"; }
  var out = [];
  var node = el;
  for (var i = 0; i < 6 && node; i++) {
    var r = node.getBoundingClientRect();
    var cs = getComputedStyle(node);
    out.push({
      tag: node.tagName + (node.id ? "#" + node.id : "") +
           (node.className ? "." + String(node.className).split(" ")[0] : ""),
      width: Math.round(r.width),
      right: Math.round(r.right),
      cssWidth: cs.width,
      minWidth: cs.minWidth,
      display: cs.display,
      padding: cs.paddingLeft + " / " + cs.paddingRight
    });
    node = node.parentElement;
  }
  var kids = Array.from(el.children).slice(0, 4).map(function (c) {
    var r = c.getBoundingClientRect();
    var cs = getComputedStyle(c);
    return (c.tagName + (c.id ? "#" + c.id : "") + (c.className ? "." + String(c.className).split(" ")[0] : "")) +
      "  幅" + Math.round(r.width) + "  css=" + cs.width + "  display=" + cs.display;
  });
  return { 画面幅: window.innerWidth, 親子: out, 中の要素: kids };
})()
