(function () {
  var out = [];
  var all = document.querySelectorAll("body *");
  for (var i = 0; i < all.length; i++) {
    var e = all[i];
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) { continue; }
    if (r.right <= window.innerWidth + 1) { continue; }
    /* いちばん外側の犯人だけ知りたいので、親がすでにはみ出していたら飛ばします */
    var pr = e.parentElement ? e.parentElement.getBoundingClientRect() : null;
    if (pr && pr.right > window.innerWidth + 1) { continue; }
    var cs = getComputedStyle(e);
    var chain = [];
    var n = e;
    for (var k = 0; k < 4 && n; k++) {
      chain.push(n.tagName + (n.id ? "#" + n.id : "") +
        (n.className ? "." + String(n.className).split(" ").slice(0, 2).join(".") : ""));
      n = n.parentElement;
    }
    out.push({
      要素: chain.join(" < "),
      右端: Math.round(r.right),
      幅: Math.round(r.width),
      css幅: cs.width,
      表示: cs.display,
      流し込み: cs.float,
      折り返し: cs.whiteSpace,
      文字: (e.innerText || "").replace(/\s+/g, " ").slice(0, 40)
    });
    if (out.length >= 6) { break; }
  }
  return { 画面幅: window.innerWidth, はみ出し: out };
})()
