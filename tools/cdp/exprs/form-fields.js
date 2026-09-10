(function () {
  var out = [];
  Array.prototype.forEach.call(document.querySelectorAll("input, textarea, select"), function (e) {
    if (e.type === "hidden") { return; }
    var label = "";
    if (e.id) {
      var l = document.querySelector('label[for="' + e.id + '"]');
      if (l) { label = (l.innerText || "").replace(/\s+/g, ""); }
    }
    if (!label) {
      var tr = e.closest("tr");
      if (tr) { var th = tr.querySelector("th, td"); if (th) { label = (th.innerText || "").replace(/\s+/g, "").slice(0, 20); } }
    }
    out.push((e.tagName + "/" + (e.type || "")).padEnd(16) + "name=" + (e.name || "(なし)").padEnd(24) +
      " 値=[" + String(e.value || "").replace(/\s+/g, " ").slice(0, 34) + "]  見出し=" + label);
  });
  return { 見出し: document.title, 項目数: out.length, 項目: out.slice(0, 24) };
})()
