(function () {
  function flat(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  var cells = document.querySelectorAll("td.itemtext, td.categorylist, li.itemBox, td.itemBox");
  var total = document.querySelector("p.total, p.searchResult");
  var first = cells[0] || null;
  var prices = Array.prototype.map.call(
    document.querySelectorAll(".M_cl_taxPrice, p.price, td.woong, .rankPrice"),
    function (e) { return flat(e.innerText); }).filter(Boolean);
  return {
    件数の表示: total ? flat(total.innerText).slice(0, 60) : "(無し)",
    一覧のセル: cells.length,
    先頭セル: first ? flat(first.innerText).slice(0, 150) : "(無し)",
    価格の見え方: prices.slice(0, 6),
    桁区切りのある価格: prices.filter(function (p) { return /[0-9],[0-9]{3}/.test(p); }).length,
    桁区切りの無い4桁以上: prices.filter(function (p) { return /(^|[^0-9,])[0-9]{4,}/.test(p); }).length,
    商品リンク: document.querySelectorAll('a[href*="/shopdetail/"], a[href*="/view/item/"]').length
  };
})()
