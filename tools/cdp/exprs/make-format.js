(function () {
  /* 必要な6列だけのフォーマットを作ります。
     0  商品特定コード指定（アップロード時必須）
     2  システム商品コード（商品を特定する鍵）
     44 画像説明文2      … 販売単位の表（移す元）
     46 画像説明文3      … 名入れ料金の表（移す元）
     87 スマホ商品説明2   … $item.description4（移す先）
     90 PC用追加商品説明文 … $item.description2（移す先） */
  var WANT = [0, 2, 44, 46, 87, 90];

  var name = document.querySelector('input[type="text"]');
  if (!name) { return "(名前の欄がありません)"; }
  var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(name, "移行用_説明文の移し替え");
  name.dispatchEvent(new Event("input", { bubbles: true }));
  name.dispatchEvent(new Event("change", { bubbles: true }));

  var off = Array.from(document.querySelectorAll("button")).filter(function (b) {
    return (b.innerText || "").replace(/\s+/g, "") === "全て非表示";
  })[0];
  if (!off) { return "(全て非表示がありません)"; }
  off.click();

  var boxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
  var on = [];
  WANT.forEach(function (i) {
    var cb = boxes[i];
    if (!cb) { return; }
    if (!cb.checked) { cb.click(); }
    on.push(i + ":" + (cb.checked ? "入" : "切"));
  });
  return { name: name.value, checked: on, total: boxes.filter(function (c) { return c.checked; }).length };
})()
