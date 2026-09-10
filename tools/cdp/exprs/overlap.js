(function () {
  var doc = document.documentElement;
  var view = doc.clientWidth;

  function label(e) {
    return e.tagName +
      (e.id ? "#" + e.id : "") +
      (typeof e.className === "string" && e.className.trim()
        ? "." + e.className.trim().split(/[\t ]+/).slice(0, 2).join(".") : "");
  }
  function text(e) {
    return (e.innerText || "").replace(/[\r\n\t ]+/g, " ").trim().slice(0, 34);
  }
  function rect(e) { return e.getBoundingClientRect(); }
  function area(r) { return Math.max(0, r.width) * Math.max(0, r.height); }
  function cross(a, b) {
    var x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    var y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return (x > 0 && y > 0) ? x * y : 0;
  }

  var out = { view: view, overlaps: [], outOfParent: [], clipped: [], tiny: [] };

  /* ── ① 重なり ──────────────────────────────────────────────
     兄弟どうしが重なっているものだけ見ます。親子は当然重なるので除外。
     位置指定（absolute/fixed）は重ねるのが目的なので除外します。 */
  var parents = new Set();
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    if (e.parentElement) { parents.add(e.parentElement); }
  });
  parents.forEach(function (par) {
    var kids = Array.from(par.children).filter(function (e) {
      var cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") { return false; }
      if (cs.position === "absolute" || cs.position === "fixed") { return false; }
      if (cs.cssFloat !== "none") { return false; }
      var r = rect(e);
      return r.width > 4 && r.height > 4;
    });
    for (var i = 0; i < kids.length; i++) {
      for (var j = i + 1; j < kids.length; j++) {
        /* ※ インラインどうしは重なりません
         *
         *    折り返したインライン要素の外接ボックスは、複数行をまとめた
         *    大きな箱になります。同じ段落の中の
         *    `<span class="M_cl_taxPrice">44572</span>` と
         *    `<span class="M_outtax">（税込）</span>` が「84%重なっている」
         *    と出ていましたが、**実際には横に並んでいるだけ**でした。
         *    カテゴリのスマホ表示で39件、これを不具合として挙げていました。 */
        var da = getComputedStyle(kids[i]).display;
        var db = getComputedStyle(kids[j]).display;
        if (da === "inline" && db === "inline") { continue; }
        var ra = rect(kids[i]), rb = rect(kids[j]);
        var over = cross(ra, rb);
        if (over < 40) { continue; }
        var small = Math.min(area(ra), area(rb));
        if (small <= 0) { continue; }
        /* 面積の 12% 以上かぶっていたら「重なり」と見ます */
        if (over / small < 0.12) { continue; }
        out.overlaps.push({
          a: label(kids[i]) + " [" + text(kids[i]) + "]",
          b: label(kids[j]) + " [" + text(kids[j]) + "]",
          pct: Math.round(over / small * 100),
          box: Math.round(ra.left) + "," + Math.round(ra.top) + " / " +
               Math.round(rb.left) + "," + Math.round(rb.top)
        });
      }
    }
  });

  /* ── ② 親の箱からはみ出している中身 ───────────────────────
     これが「ズレ」の正体になりやすいところです。 */
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    var par = e.parentElement;
    if (!par || par === document.body) { return; }
    var pcs = getComputedStyle(par);
    if (pcs.overflowX !== "visible" || pcs.overflowY !== "visible") { return; }
    /* ※ 祖先のどこかで切られていれば、はみ出しては見えません
     *
     *    親だけ見ていたので、スライダーの複製（UL#M_slider の中の LI）を
     *    毎ページ数十件ずつ挙げていました。UL 自体は overflow:visible ですが、
     *    その親の .bx-viewport が hidden で切っています。**画面には出ません。**
     *    合計1,921件のうち、大半がこれでした。 */
    var anc = par;
    while (anc && anc !== doc) {
      var acs = getComputedStyle(anc);
      if (acs.overflowX !== "visible" || acs.overflowY !== "visible") { return; }
      anc = anc.parentElement;
    }
    /* ※ インラインの親は「箱」ではありません
     *
     *    <a><img></a> のような形だと、a の高さは行の高さしかないので、
     *    画像が必ず「下にはみ出して」見えます。実際には正しく表示されて
     *    います。商品詳細で2件、これを不具合として挙げていました。
     *    親がインラインなら見ません。 */
    if (pcs.display === "inline") { return; }
    var cs = getComputedStyle(e);
    if (cs.position === "absolute" || cs.position === "fixed") { return; }
    if (cs.display === "none") { return; }
    var r = rect(e), pr = rect(par);
    if (r.width < 4 || r.height < 4 || pr.width < 4) { return; }
    var outRight = r.right - pr.right;
    var outLeft = pr.left - r.left;
    var outBottom = r.bottom - pr.bottom;
    if (outRight > 3 || outLeft > 3 || outBottom > 3) {
      out.outOfParent.push({
        what: label(e) + " [" + text(e) + "]",
        parent: label(par),
        右: Math.round(outRight), 左: Math.round(outLeft), 下: Math.round(outBottom)
      });
    }
  });

  /* ── ③ 文字が切れている ──────────────────────────────────── */
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    var cs = getComputedStyle(e);
    if (cs.overflow === "visible") { return; }
    if (!e.innerText || !e.innerText.trim()) { return; }
    if (e.scrollHeight > e.clientHeight + 4 && e.clientHeight > 0 && cs.overflowY === "hidden") {
      out.clipped.push(label(e) + " [" + text(e) + "] 中身 " + e.scrollHeight + " / 枠 " + e.clientHeight);
    }
  });

  /* ── ④ つぶれた要素（高さ0なのに中身がある） ───────────── */
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    var r = rect(e);
    if (r.height > 2 || r.width < 20) { return; }
    if (!e.innerText || !e.innerText.trim()) { return; }
    var cs = getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden") { return; }
    out.tiny.push(label(e) + " [" + text(e) + "]");
  });

  out.count = {
    重なり: out.overlaps.length,
    親からはみ出し: out.outOfParent.length,
    文字切れ: out.clipped.length,
    つぶれ: out.tiny.length
  };
  out.overlaps = out.overlaps.slice(0, 14);
  out.outOfParent = out.outOfParent.slice(0, 14);
  out.clipped = out.clipped.slice(0, 8);
  out.tiny = out.tiny.slice(0, 8);
  return out;
})()
