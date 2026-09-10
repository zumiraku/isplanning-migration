(function () {
  var t = document.querySelector("#tab-content3");
  if (!t) { return { found: false }; }
  var links = Array.prototype.map.call(t.querySelectorAll("a"), function (a) {
    return (a.getAttribute("href") || "(href無し)") + "  「" + (a.innerText || "").replace(/\s+/g, "") + "」";
  });
  return {
    found: true,
    text: (t.innerText || "").replace(/\s+/g, " ").trim(),
    textLen: (t.innerText || "").replace(/\s+/g, "").length,
    height: Math.round(t.getBoundingClientRect().height),
    links: links,
    html: (t.innerHTML || "").replace(/\s+/g, " ").trim().slice(0, 700)
  };
})()
