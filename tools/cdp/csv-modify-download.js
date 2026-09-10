/* ---------------------------------------------------------------------------
   csv-modify-download.js — 「商品一括修正」用のCSVを落とす

   ※ 全85列を往復させません

      「商品情報一括アップロード」は出力した85列をそのまま戻す作り方です。
      9,643商品の**全項目を書き戻す**ことになり、1列でも取り違えれば
      カタログ全体を壊します。

      「商品一括修正」には専用のフォーマットがあります。**必要な列だけ**を
      扱えるので、こちらを使います。

     node tools/cdp/csv-modify-download.js
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");

const AT = "https://shop1.makeshop.jp/makeshop/newmanager/product_import_modify_brand.html";
const OUT = path.resolve("tools/cdp/csv");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const before = new Set(fs.readdirSync(OUT));

  const p = await page();
  await p.navigate(AT);
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    if (await p.evaluate("document.forms.download_form ? 1 : 0")) { break; }
  }
  await p.send("Page.enable");
  await p.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: OUT });

  const sent = await p.evaluate(`(function(){
    var f = document.forms.download_form;
    if (!f) { return "(フォームがありません)"; }
    if (f.elements.code) { f.elements.code.value = "0"; }   /* すべての商品 */
    f.submit();
    return "submitted";
  })()`);
  console.log(sent);

  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    const now = fs.readdirSync(OUT).filter(f => !before.has(f) && !f.endsWith(".crdownload"));
    if (now.length) {
      now.forEach(f => console.log("落ちました: " + f + "  " + fs.statSync(path.join(OUT, f)).size + " バイト"));
      p.close(); return;
    }
  }
  const body = await p.evaluate(`(document.body.innerText||"").replace(/\\s+/g," ").slice(0,400)`);
  console.log("※ 落ちてきません。画面: " + body);
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
