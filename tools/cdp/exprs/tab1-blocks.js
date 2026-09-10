(function () {
  /* タブ1の中を、見出しで区切って商品数を数えます */
  var tab = document.querySelector("#tab-content1");
  if (!tab) { return { err: "#tab-content1 が無い" }; }

  var out = { blocks: [] };
  var kids = Array.prototype.slice.call(tab.querySelectorAll("h2, h3, .section, ul, table"));
  /* 見出しごとに、その直後から次の見出しまでの「税込」を数えます */
  var heads = Array.prototype.slice.call(tab.querySelectorAll("h2, h3"));
  heads.forEach(function (h, i) {
    var next = heads[i + 1] || null;
    var n = 0, imgs = 0;
    var node = h;
    while ((node = node.nextElementSibling || (node.parentElement && node.parentElement.nextElementSibling))) {
      if (next && (node === next || node.contains(next))) { break; }
      var t = node.textContent || "";
      n += (t.match(/税込/g) || []).length;
      imgs += node.querySelectorAll("img").length;
      if (!node.nextElementSibling && node.parentElement === tab) { break; }
    }
    out.blocks.push({
      midashi: (h.innerText || "").replace(/[\s　]+/g, " ").trim().slice(0, 26),
      zeikomi: n,
      img: imgs
    });
  });
  return out;
})()
