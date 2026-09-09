(function () {
  var f = document.forms.formPreview;
  var a = Array.from(document.querySelectorAll("a")).filter(function (e) {
    return ((e.innerText || "") + "").indexOf("プレビュー") >= 0;
  });
  function handler(el) {
    try {
      var ev = window.jQuery && window.jQuery._data ? window.jQuery._data(el, "events") : null;
      if (ev && ev.click) { return ev.click.map(function (h) { return String(h.handler).slice(0, 600); }).join(" | "); }
    } catch (e) { /* 無ければよい */ }
    return el.getAttribute("onclick") || "(束ね先が読めません)";
  }
  return {
    formPreview: f ? {
      action: f.action, method: f.method, target: f.target,
      fields: Array.from(f.elements).map(function (e) { return e.name + "=" + String(e.value).slice(0, 60); })
    } : null,
    previewLinks: a.map(function (e) { return { text: (e.innerText || "").trim(), href: e.getAttribute("href"), on: handler(e) }; }),
    fns: Object.keys(window).filter(function (k) { return /preview/i.test(k); })
  };
})()
