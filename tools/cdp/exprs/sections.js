(function () {
  function flat(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  var main = document.querySelector(".M_mainContents") || document.body;
  var heads = main.querySelectorAll("h2, h3");
  var out = [];
  for (var i = 0; i < heads.length; i++) {
    var h = heads[i], next = heads[i + 1] || null;
    var n = 0, seen = {};
    var node = h;
    while (node) {
      var walker = node.nextElementSibling;
      if (!walker) { node = node.parentElement; if (!node || node === main.parentElement) { break; } continue; }
      node = walker;
      if (next && (node === next || node.contains(next))) { break; }
      var links = node.querySelectorAll ? node.querySelectorAll('a[href*="/shopdetail/"], a[href*="/view/item/"]') : [];
      for (var k = 0; k < links.length; k++) {
        var u = links[k].getAttribute("href");
        if (!seen[u]) { seen[u] = 1; n++; }
      }
      if (node.matches && node.matches("h2, h3")) { break; }
    }
    out.push(flat(h.innerText).slice(0, 20) + "  … 商品 " + n + " 件");
  }
  return { 区切り: out };
})()
