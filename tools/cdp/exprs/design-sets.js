(function () {
  var out = [];
  Array.from(document.querySelectorAll("a")).forEach(function (a) {
    var t = (a.innerText || "").replace(/\s+/g, " ").trim();
    if (t.indexOf("コードを編集") < 0) { return; }
    /* セット名は同じ塊の上のほうにある */
    var box = a, name = "";
    for (var i = 0; i < 6 && box; i++) {
      box = box.parentElement;
      if (!box) { break; }
      var txt = (box.innerText || "").replace(/\s+/g, " ").trim();
      if (txt.length > 10 && txt.length < 200) { name = txt; break; }
    }
    out.push({
      name: name.slice(0, 90),
      href: a.href,
      onclick: String(a.getAttribute("onclick") || "").slice(0, 200)
    });
  });
  return out;
})()
