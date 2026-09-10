(function () {
  var f = document.formPreview;
  if (!f) { return { found: false }; }
  var fields = [];
  for (var i = 0; i < f.elements.length; i++) {
    var e = f.elements[i];
    fields.push(e.name + " = " + String(e.value).replace(/\s+/g, " ").slice(0, 70));
  }
  return { found: true, action: f.action, method: f.method, fields: fields };
})()
