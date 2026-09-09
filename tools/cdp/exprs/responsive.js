(function () {
  var t = (document.body.innerText || "").replace(/\s+/g, " ");
  var i = t.indexOf("レスポンシブ");
  var toggle = Array.from(document.querySelectorAll('input[type="checkbox"], .v-switch input')).map(function (c) {
    var box = c, label = "";
    for (var k = 0; k < 6 && box.parentElement; k++) {
      box = box.parentElement;
      var s = (box.innerText || "").replace(/\s+/g, " ").trim();
      if (s && s.length < 40) { label = s; break; }
    }
    return label + " = " + (c.checked ? "入" : "切");
  }).filter(function (x) { return x.indexOf("レスポンシブ") >= 0; });

  /* PC / スマホ の切り替えがどこにあるか */
  var tabs = Array.from(document.querySelectorAll("a, button")).map(function (e) {
    return (e.innerText || "").replace(/\s+/g, " ").trim();
  }).filter(function (s) { return s === "PC" || s === "スマホ" || s === "スマートフォン"; });

  return {
    まわりの文: i < 0 ? "(見つかりません)" : t.slice(Math.max(0, i - 120), i + 200),
    トグル: toggle,
    切り替え: tabs
  };
})()
