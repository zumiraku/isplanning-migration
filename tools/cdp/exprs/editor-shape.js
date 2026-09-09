(function () {
  var save = Array.from(document.querySelectorAll("a, button, input")).filter(function (e) {
    return ((e.innerText || e.value || "") + "").replace(/\s+/g, " ").trim() === "保存";
  }).map(function (e) {
    return {
      tag: e.tagName, href: e.getAttribute("href") || "",
      onclick: String(e.getAttribute("onclick") || "").slice(0, 300),
      cls: e.className, id: e.id
    };
  });

  var ta = document.querySelector('[name="content_html_pc"]');
  var editors = {
    CodeMirror: document.querySelectorAll(".CodeMirror").length,
    cm6: document.querySelectorAll(".cm-editor").length,
    ace: document.querySelectorAll(".ace_editor").length,
    monaco: document.querySelectorAll(".monaco-editor").length
  };

  var f = document.forms.formMain;
  var fields = f ? Array.from(f.elements).map(function (e) {
    return (e.name || "(無名)") + " : " + e.tagName + (e.type ? "/" + e.type : "") +
           " = " + String(e.value || "").slice(0, 40).replace(/\s+/g, " ");
  }) : [];

  return {
    saveControls: save,
    editors: editors,
    textareaHead: ta ? ta.value.slice(0, 120) : "(無し)",
    textareaLen: ta ? ta.value.length : -1,
    formAction: f ? f.action : "(無し)",
    formMethod: f ? f.method : "",
    fields: fields.slice(0, 40),
    globals: Object.keys(window).filter(function (k) { return /save|submit|editor|flex/i.test(k); }).slice(0, 40)
  };
})()
