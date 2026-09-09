(function () {
  /* 商品詳細の4つの説明タグに、それぞれ何が入るのかを実データで確かめます。
     プレビューに印つきで4つとも出させて、あとで数えます。 */
  var ed = g_editor_object.html_pc;
  var body = ed.getValue();
  var probe = [
    '<div id="PROBE">',
    '<div id="PROBE1">[[D1]]<{$item.description}>[[/D1]]</div>',
    '<div id="PROBE2">[[D2]]<{$item.description2}>[[/D2]]</div>',
    '<div id="PROBE3">[[D3]]<{$item.description3}>[[/D3]]</div>',
    '<div id="PROBE4">[[D4]]<{$item.description4}>[[/D4]]</div>',
    '<div id="PROBE5">[[SD]]<{$item.special_display}>[[/SD]]</div>',
    '</div>'
  ].join("\n");
  /* </body> の直前に差し込みます。保存はしません（プレビューだけ）。 */
  ed.setValue(body.replace("</body>", probe + "\n</body>"));
  document.formPreview.target = "_self";
  previewContent();
  return "sent";
})()
