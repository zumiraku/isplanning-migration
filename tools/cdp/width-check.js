/* ---------------------------------------------------------------------------
   width-check.js — 実際に配信されるページを、幅を変えて測る

   手元のプレビューHTMLではなく、**サーバーが返した本物**を測ります。
   ヘッドレスの --window-size がこの環境で効かず、375pxのつもりが500pxで
   描かれていた、という失敗をしています。ここでは本物のブラウザに
   幅を指定して、そのページ自身に測らせます。

     node tools/cdp/width-check.js
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const WIDTHS = [320, 375, 414, 768, 960, 1280];
const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const PAGES = [["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["買い物カゴ", 6], ["特定商取引法", 13]];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const MEASURE = `(function(){
  var d = document.documentElement, b = document.body;
  var w = Math.max(d.scrollWidth, b ? b.scrollWidth : 0);
  var over = [];
  var all = document.querySelectorAll("body *");
  for (var i = 0; i < all.length; i++) {
    var r = all[i].getBoundingClientRect();
    if (r.width === 0 || r.height === 0) { continue; }
    if (r.right > window.innerWidth + 1) {
      over.push(all[i].tagName + (all[i].id ? "#" + all[i].id : "") +
        (all[i].className && all[i].className.toString ? "." + all[i].className.toString().split(" ")[0] : "") +
        " right=" + Math.round(r.right));
      if (over.length >= 4) { break; }
    }
  }
  return { view: window.innerWidth, scroll: w, over: over };
})()`;

(async () => {
  const p = await page();
  let ng = 0;

  for (const [name, type] of PAGES) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    let ok = false;
    for (let i = 0; i < 30 && !ok; i++) {
      await sleep(500);
      ok = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
    }
    if (!ok) { console.log(name + " 🔴 エディタが出ません"); continue; }
    await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
    for (let i = 0; i < 30; i++) {
      await sleep(700);
      if ((await p.evaluate("location.href")).indexOf("isp-sp.com") >= 0) { break; }
    }
    await sleep(1500);

    const line = [];
    for (const w of WIDTHS) {
      await p.send("Emulation.setDeviceMetricsOverride",
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 700 });
      await sleep(900);
      const r = await p.evaluate(MEASURE);
      const bad = r.scroll > r.view + 1;
      if (bad) { ng++; }
      line.push(w + (bad ? "🔴" + r.scroll : "○"));
      if (bad) { console.log("    " + name + " " + w + "px はみ出し " + r.scroll + " : " + r.over.join(" / ")); }
    }
    console.log(name.padEnd(14) + line.join("  "));
  }

  await p.send("Emulation.clearDeviceMetricsOverride");
  p.close();
  console.log("");
  console.log(ng ? "🔴 はみ出し " + ng + " 件" : "✅ どの幅でも横にはみ出していません");
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
