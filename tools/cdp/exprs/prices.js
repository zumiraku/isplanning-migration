(function () {
  var t = (document.body ? document.body.innerText : "").replace(/\s+/g, " ");
  /* 「1,234円」「1234円」の両方を拾います */
  var all = t.match(/[0-9][0-9,]*円/g) || [];
  var withComma = [], noComma = [];
  all.forEach(function (s) {
    var digits = s.replace(/[^0-9]/g, "");
    if (digits.length <= 3) { return; }          /* 3桁以下は区切りが出ません */
    if (s.indexOf(",") >= 0) { withComma.push(s); } else { noComma.push(s); }
  });
  function uniq(a) { var s = {}; return a.filter(function (x) { if (s[x]) { return false; } s[x] = 1; return true; }); }
  return {
    円の付いた数: all.length,
    四桁以上_区切りあり: withComma.length,
    四桁以上_区切りなし: noComma.length,
    区切りなしの例: uniq(noComma).slice(0, 10)
  };
})()
