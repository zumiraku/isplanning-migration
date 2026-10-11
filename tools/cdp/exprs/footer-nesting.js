(function () {
  function chain(sel) {
    var el = document.querySelector(sel);
    if (!el) { return sel + " : (ありません)"; }
    var out = [];
    var n = el;
    for (var i = 0; i < 7 && n; i++) {
      out.push(n.tagName + (n.id ? "#" + n.id : "") +
        (n.className ? "." + String(n.className).split(" ")[0] : "") +
        "(" + Math.round(n.getBoundingClientRect().width) + ")");
      n = n.parentElement;
    }
    return sel + " : " + out.join("  <  ");
  }
  var oc = document.querySelector("#O_container");
  var sibs = oc && oc.parentElement
    ? Array.from(oc.parentElement.children).map(function (c) {
        return c.tagName + (c.id ? "#" + c.id : "") +
          (c.className ? "." + String(c.className).split(" ")[0] : "") +
          "(" + Math.round(c.getBoundingClientRect().width) + ")";
      })
    : [];
  return {
    幅: window.innerWidth,
    footer_guideWrap: chain("#footer_guideWrap"),
    colum_wrap: chain("#colum-wrap"),
    O_containerの兄弟: sibs
  };
})()
