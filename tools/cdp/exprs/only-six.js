(function () {
  /* 「全て非表示」を押しても外れないことがあるので、1つずつ揃えます。 */
  var WANT = [0, 2, 44, 46, 87, 90];
  var boxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
  var changed = 0;
  boxes.forEach(function (cb, i) {
    var want = WANT.indexOf(i) >= 0;
    if (cb.checked !== want) { cb.click(); changed++; }
  });
  return {
    changed: changed,
    checked: boxes.map(function (c, i) { return c.checked ? i : null; }).filter(function (x) { return x !== null; })
  };
})()
