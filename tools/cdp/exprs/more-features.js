(function () {
  var els = Array.from(document.querySelectorAll("a, button")).filter(function (e) {
    return (e.innerText || "").replace(/\s+/g, "").indexOf("機能をもっと見る") >= 0;
  });
  if (!els.length) { return "(見つかりません)"; }
  els[0].click();
  return "clicked " + els.length + " 個中の1つ目";
})()
