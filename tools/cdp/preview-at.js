/* ---------------------------------------------------------------------------
   preview-at.js — 好きなURLを、いまのエディタ内容で描いて測ります

     node tools/cdp/preview-at.js <ページ種別> <パス> <式のファイル> [幅]
     node tools/cdp/preview-at.js 3 /view/item/051000000001 tools/cdp/exprs/tabs-map.js

   プレビューのボタンは formPreview を POST しています。その action に

     design_preview.html?page_type=flex-preview&page_path=/view/item/003001000005
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   とパスが入っています。ここを書き換えれば、**どのURLでも開けます。**
   カテゴリ専用テンプレート（ct646 は14件、ct664 は2件）のように、
   特定の商品でしか通らない道を見に行くのに要ります。

   🔴 ただし「開ける」だけで、「いま貼ったものが出る」とは限りません

      貼り直した直後に /view/item/051000000001 を開いても、**前の内容**が
      返りました。同じ保存内容で、既定の 003001000005 には印が出るのに、
      051000000001 には出ません（probe.js で確認）。商品ごとのページを
      サーバー側で持っていて、こちらからは新しくできないためです。

      **貼った直後の確認には使えません。** しばらく置いてから見ます。
      既定の商品（003001000005）はプレビューのたびに作り直されるので、
      即座の確認はそちらで行います。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const TYPE = Number(process.argv[2] || 3);
const PATH = process.argv[3];
const file = process.argv[4];
const WIDTH = Number(process.argv[5] || 0);

if (!PATH || !file) {
  console.error("使い方: node tools/cdp/preview-at.js <ページ種別> <パス> <式のファイル> [幅]");
  process.exit(1);
}
const EXPR = fs.readFileSync(file, "utf8");

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  if (WIDTH) {
    await p.send("Emulation.setDeviceMetricsOverride",
      { width: WIDTH, height: 812, deviceScaleFactor: 2, mobile: true });
    await p.send("Network.setUserAgentOverride", { userAgent: IPHONE, platform: "iPhone" });
  }
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  let ok = false;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    /* 🔴 previewContent があるだけでは足りません
     *    CodeMirror に中身が入る前に押すと、空のHTMLを送ってしまい、
     *    **枠だけのページ**が返ります。中身の長さで待ちます。 */
    const n = await p.evaluate("(typeof g_editor_object !== 'undefined' && g_editor_object.html_pc) ? g_editor_object.html_pc.getValue().length : 0");
    if (n > 200 && await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { ok = true; break; }
  }
  if (!ok) { console.error("🔴 エディタが出ません"); p.close(); process.exit(1); }

  /* action のパスだけ差し替えます */
  const set =
    "(function(){var f=document.formPreview;" +
    "f.action=f.action.replace(/page_path=.*$/, 'page_path=' + " + JSON.stringify(PATH) + ");" +
    "f.target='_self'; previewContent(); return f.action;})()";
  const action = await p.evaluate(set);

  let url = "";
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    url = await p.evaluate("location.href");
    if (url.indexOf("isp-sp.com") >= 0) { break; }
  }
  /* 商品詳細はスライダーの組み立てがあるので、長めに待ちます */
  await sleep(6000);
  const r = await p.evaluate(EXPR);
  p.close();

  console.log("種別 " + TYPE + " / " + PATH + (WIDTH ? " / " + WIDTH + "px" : ""));
  console.log("  " + action.slice(action.indexOf("page_path=")));
  console.log("  着いた先 " + url.slice(0, 80));
  console.log("");
  console.log(JSON.stringify(r, null, 2));
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
