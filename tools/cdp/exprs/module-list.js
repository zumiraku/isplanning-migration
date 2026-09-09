(function () {
  var rows = Array.from(document.querySelectorAll("tr"));
  var out = [];
  rows.forEach(function (tr) {
    var cells = Array.from(tr.querySelectorAll("td, th")).map(function (c) {
      return (c.innerText || "").replace(/\s+/g, " ").trim();
    });
    if (!cells.length) { return; }
    var a = tr.querySelector("a[href]");
    out.push({ cells: cells.slice(0, 4), href: a ? a.href : "" });
  });
  return out;
})()
