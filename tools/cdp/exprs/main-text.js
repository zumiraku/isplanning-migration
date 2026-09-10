(function () {
  function flat(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  var m = document.querySelector(".M_mainContents") || document.querySelector("#O_container") || document.body;
  var blocks = Array.prototype.map.call(m.children, function (c) {
    return c.tagName + (c.id ? "#" + c.id : "") +
      (typeof c.className === "string" && c.className ? "." + c.className.trim().split(/\s+/)[0] : "") +
      " [" + flat(c.innerText).slice(0, 40) + "]";
  });
  return {
    タイトル: document.title,
    本文の先頭: flat(m.innerText).slice(0, 320),
    本文の長さ: flat(m.innerText).length,
    直下の枠: blocks.slice(0, 14)
  };
})()
