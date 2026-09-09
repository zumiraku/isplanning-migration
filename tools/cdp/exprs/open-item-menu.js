(function () {
  var hit = Array.from(document.querySelectorAll("a")).filter(function (a) {
    return (a.innerText || "").indexOf("商品管理") >= 0;
  })[0];
  if (!hit) { return "(商品管理が見つかりません)"; }
  hit.click();
  return "clicked";
})()
