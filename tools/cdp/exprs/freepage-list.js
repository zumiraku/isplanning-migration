(function () {
  var out = [];
  Array.from(document.querySelectorAll("tr")).forEach(function (tr) {
    var cells = Array.from(tr.querySelectorAll("td")).map(function (c) {
      return (c.innerText || "").replace(/\s+/g, " ").trim();
    });
    if (!cells.length) { return; }
    var a = tr.querySelector('a[href*="page_id"], a[href*="freepage"]');
    out.push(cells.slice(0, 3).join(" | ") + (a ? "  " + a.getAttribute("href") : ""));
  });
  var pager = (document.body.innerText || "").replace(/\s+/g, " ");
  var m = pager.match(/(\d+)\s*件/);
  return { 件数表示: m ? m[0] : "(無し)", 行: out.slice(0, 60) };
})()
