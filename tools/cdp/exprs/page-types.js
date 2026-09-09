(function () {
  var out = [];
  Array.from(document.querySelectorAll("a")).forEach(function (a) {
    var h = a.getAttribute("href") || "";
    if (h.indexOf("page_type=") < 0) { return; }
    var m = h.match(/page_type=(\d+)/);
    out.push({ type: m ? Number(m[1]) : null, name: (a.innerText || "").replace(/\s+/g, " ").trim() });
  });
  out.sort(function (a, b) { return a.type - b.type; });
  return out;
})()
