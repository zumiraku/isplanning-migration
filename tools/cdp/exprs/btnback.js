(function () {
  var w = document.querySelector(".btnWrap.clear");
  var b = document.querySelector(".btnBack");
  var a = b ? b.querySelector("a") : null;
  function d(e, label) {
    if (!e) { return label + " = 無し"; }
    var s = getComputedStyle(e), r = e.getBoundingClientRect();
    return label + " = " + Math.round(r.width) + "x" + Math.round(r.height) +
      "  背景=" + s.backgroundImage.slice(0, 70) + "  文字=[" + (e.innerText || "").replace(/\s+/g, "") + "]";
  }
  return {
    枠: d(w, ".btnWrap.clear"),
    戻る: d(b, ".btnBack"),
    リンク: d(a, ".btnBack a"),
    リンク数: b ? b.querySelectorAll("a").length : -1,
    中身: b ? b.innerHTML.replace(/\s+/g, " ").slice(0, 200) : ""
  };
})()
