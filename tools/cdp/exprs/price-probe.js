(function () {
  var b = document.body;
  var t = b ? b.innerText : "";
  function n(sel) { try { return document.querySelectorAll(sel).length; } catch (e) { return -1; } }
  var yen = t.match(new RegExp("[0-9,]+\\s*円[^\\n]{0,18}", "g")) || [];
  return {
    "M_cl_taxPrice": n(".M_cl_taxPrice"),
    "price": n(".price"),
    "M_itemPrice": n("#M_itemPrice"),
    "itemPrice系": n("[class*=Price], [id*=Price], [class*=price], [id*=price]"),
    "円を含む行": yen.slice(0, 5),
    "円の総数": (t.match(/円/g) || []).length
  };
})()
