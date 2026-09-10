(function () {
  var a = document.querySelector("#M_basket") ||
          document.querySelector('a[href="/shop/basket.html"]') ||
          document.querySelector('a[href="/view/cart"]');
  if (!a) { return { found: false }; }
  var box = a.closest(".M_headBasket") || a.parentElement;
  var r = a.getBoundingClientRect();
  return {
    found: true,
    href: a.getAttribute("href"),
    text: (a.textContent || "").replace(/\s+/g, ""),
    html: (box.innerHTML || "").replace(/\s+/g, " ").trim().slice(0, 600),
    left: Math.round(r.left), top: Math.round(r.top),
    width: Math.round(r.width), height: Math.round(r.height)
  };
})()
