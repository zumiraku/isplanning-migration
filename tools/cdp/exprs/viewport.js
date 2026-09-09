(function () {
  var m = document.querySelector('meta[name="viewport"]');
  var h = document.querySelector("#headerWrap");
  var out = {
    compatMode: document.compatMode,
    doctype: document.doctype ? document.doctype.name : "(なし)",
    viewportMeta: m ? m.content : "(なし)",
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    visual: window.visualViewport ? Math.round(window.visualViewport.width) : -1,
    bodyScrollW: document.body.scrollWidth,
    htmlScrollW: document.documentElement.scrollWidth
  };
  if (h) {
    out.headerWidth = Math.round(h.getBoundingClientRect().width);
    out.inlineBefore = h.style.width || "(なし)";
    /* 幅を明示したら収まるかを、その場で試します */
    h.style.width = "100vw";
    out.with100vw = Math.round(h.getBoundingClientRect().width);
    h.style.width = "";
    h.style.left = "0";
    h.style.right = "0";
    out.withLeftRight = Math.round(h.getBoundingClientRect().width);
    h.style.left = "";
    h.style.right = "";
    h.style.width = out.inlineBefore === "(なし)" ? "" : out.inlineBefore;
  }
  return out;
})()
