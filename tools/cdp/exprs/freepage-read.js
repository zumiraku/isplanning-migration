(function () {
  var f = document.forms.formMain;
  var g = function (n) { var e = f && f.elements[n]; return e ? e.value : ""; };
  var cm = document.querySelector(".CodeMirror");
  var v = cm && cm.CodeMirror ? cm.CodeMirror.getValue() : "";
  var a = v.indexOf("<title>");
  var b = v.indexOf("</title>");
  return {
    pageId: g("page_id"),
    name: g("name").slice(0, 30),
    len: v.length,
    title: (a >= 0 && b > a) ? v.slice(a + 7, b).slice(0, 44) : "(無し)"
  };
})()
