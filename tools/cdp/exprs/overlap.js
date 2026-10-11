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

  /* 兄弟どうしだけ。absolute/fixed は重ねるのが目的なので除外 */
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
        /* インラインどうしは見ない: 折り返すと外接ボックスが複数行を包み、横並びでも重なって出る */
        var da = getComputedStyle(kids[i]).display;
        var db = getComputedStyle(kids[j]).display;
        if (da === "inline" && db === "inline") { continue; }
        var ra = rect(kids[i]), rb = rect(kids[j]);
        var over = cross(ra, rb);
        if (over < 40) { continue; }
        var small = Math.min(area(ra), area(rb));
        if (small <= 0) { continue; }
        /* 小さいほうの面積の12%以上で重なり扱い */
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

  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    var par = e.parentElement;
    if (!par || par === document.body) { return; }
    var pcs = getComputedStyle(par);
    if (pcs.overflowX !== "visible" || pcs.overflowY !== "visible") { return; }
    /* 祖先のどこかで切られていれば見えない（.bx-viewport が hidden のスライダー等） */
    var anc = par;
    while (anc && anc !== doc) {
      var acs = getComputedStyle(anc);
      if (acs.overflowX !== "visible" || acs.overflowY !== "visible") { return; }
      anc = anc.parentElement;
    }
    /* インラインの親は行の高さしかない（<a><img></a>）ので見ない */
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

  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    var cs = getComputedStyle(e);
    if (cs.overflow === "visible") { return; }
    if (!e.innerText || !e.innerText.trim()) { return; }
    if (e.scrollHeight > e.clientHeight + 4 && e.clientHeight > 0 && cs.overflowY === "hidden") {
      out.clipped.push(label(e) + " [" + text(e) + "] 中身 " + e.scrollHeight + " / 枠 " + e.clientHeight);
    }
  });

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
