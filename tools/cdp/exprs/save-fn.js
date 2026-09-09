(function () {
  function src(f) { try { return String(f).slice(0, 1600); } catch (e) { return "(読めません)"; } }
  return {
    saveContent: src(window.saveContent),
    getEditorContent: src(window.getEditorContent),
    editorKeys: window.g_editor_object ? Object.keys(window.g_editor_object).slice(0, 20) : "(無し)",
    saveClick: (function () {
      var a = document.querySelector("a.save-button");
      if (!a) { return "(保存ボタンが見つかりません)"; }
      /* jQuery で束ねられている場合は、そちらを覗きます */
      try {
        var ev = window.jQuery && window.jQuery._data ? window.jQuery._data(a, "events") : null;
        if (ev && ev.click) { return ev.click.map(function (h) { return String(h.handler).slice(0, 900); }).join("\n---\n"); }
      } catch (e) { /* 無ければよい */ }
      return "(クリックの束ね先が読めません)";
    })()
  };
})()
