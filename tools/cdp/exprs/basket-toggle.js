(function () {
  var sw = document.querySelector("#M_headBasketSwitch");
  var opened = document.querySelector("#M_basketOpenedBox");
  var out = {
    関数あり: (typeof window.MakeShop_toggleBasketBox === "function"),
    切替要素: !!sw,
    onmouseover: sw ? String(sw.getAttribute("onmouseover")) : "(要素なし)",
    onmouseout: sw ? String(sw.getAttribute("onmouseout")) : "(要素なし)",
    開いた枠の表示: opened ? getComputedStyle(opened).display : "(要素なし)"
  };
  if (sw && typeof window.MakeShop_toggleBasketBox === "function") {
    try {
      window.MakeShop_toggleBasketBox(true);
      out.呼んだあとの表示 = opened ? getComputedStyle(opened).display : "(要素なし)";
      window.MakeShop_toggleBasketBox(false);
    } catch (e) { out.呼んだあとの表示 = "エラー " + e.message; }
  }
  return out;
})()
