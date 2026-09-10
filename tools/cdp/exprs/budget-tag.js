(function () {
  var out = [];
  Array.prototype.forEach.call(document.querySelectorAll("td.lims b, .lims b"), function (b) {
    var t = (b.innerText || "").replace(/\s+/g, "");
    if (t) { out.push(t); }
  });
  var seen = {}, uniq = [];
  out.forEach(function (t) { if (!seen[t]) { seen[t] = 1; uniq.push(t); } });
  return {
    タイルの角かっこ: out.length,
    種類: uniq.slice(0, 12),
    リンク先: Array.prototype.map.call(document.querySelectorAll("td.lims b"), function (b) {
      var a = b.closest("a");
      return a ? a.getAttribute("href") : "(リンク無し)";
    }).slice(0, 4)
  };
})()
