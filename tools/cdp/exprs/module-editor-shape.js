(function () {
  var cm = document.querySelectorAll(".CodeMirror");
  var inst = [];
  for (var i = 0; i < cm.length; i++) {
    var o = cm[i].CodeMirror;
    inst.push({
      has: !!o,
      len: o ? o.getValue().length : -1,
      textarea: o && o.getTextArea ? (o.getTextArea().name || "(無名)") : "(不明)"
    });
  }
  function src(f) { try { return String(f).slice(0, 500); } catch (e) { return ""; } }
  return {
    codeMirrorCount: cm.length,
    instances: inst,
    globals: Object.keys(window).filter(function (k) { return /save|editor|module/i.test(k); }).slice(0, 30),
    saveContent: src(window.saveContent),
    contentField: (function () {
      var e = document.forms.formMain ? document.forms.formMain.elements.content : null;
      return e ? { tag: e.tagName, len: (e.value || "").length } : null;
    })()
  };
})()
