(function () {
  var b = Array.from(document.querySelectorAll("button")).filter(function (x) {
    return (x.innerText || "").indexOf("この内容で決定") >= 0;
  })[0];
  if (!b) { return "(ダイアログが開いていません)"; }
  var box = b;
  for (var i = 0; i < 8 && box.parentElement; i++) {
    box = box.parentElement;
    if ((box.innerText || "").length > 200) { break; }
  }
  var inputs = Array.from(box.querySelectorAll('input[type="text"]'));
  var fmt = inputs[inputs.length - 1];
  if (!fmt) { return "(フォーマット欄がありません)"; }
  fmt.focus();
  fmt.click();
  var opts = Array.from(document.querySelectorAll('[role="option"], .v-list-item')).map(function (o) {
    return (o.innerText || "").replace(/\s+/g, " ").trim();
  }).filter(function (t) { return t && t.length < 40; });
  return { 開いた: true, 候補: opts.slice(0, 20) };
})()
