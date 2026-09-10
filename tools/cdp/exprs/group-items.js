(function () {
  var t = document.querySelector("#M_group");
  if (!t) { return { found: false }; }
  var names = Array.prototype.map.call(t.querySelectorAll("p.name"), function (p) {
    return (p.innerText || "").replace(/\s+/g, "").slice(0, 26);
  });
  var prices = Array.prototype.map.call(t.querySelectorAll("p.price"), function (p) {
    return (p.innerText || "").replace(/\s+/g, "");
  });
  var head = t.previousElementSibling;
  return {
    found: true,
    見出し: head ? (head.innerText || "").replace(/\s+/g, "") : "(無し)",
    件数: names.length,
    価格の数: prices.length,
    名前: names
  };
})()
