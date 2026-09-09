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

  /* Vuetify の選択欄は、input ではなく外側の枠が開閉を持っています。
     本物の押下に近い順番でイベントを出します。 */
  var field = fmt.closest(".v-field") || fmt.parentElement;
  ["pointerdown", "mousedown", "mouseup", "click"].forEach(function (t) {
    field.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true }));
  });
  fmt.focus();
  fmt.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

  var opts = Array.from(document.querySelectorAll('.v-overlay-container .v-list-item, [role="listbox"] [role="option"]'))
    .map(function (o) { return (o.innerText || "").replace(/\s+/g, " ").trim(); })
    .filter(Boolean);
  return { 候補: opts.slice(0, 20) };
})()
