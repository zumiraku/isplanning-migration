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
/* 🔴 5種別しか測っていませんでした。全種別まわします（2026-09-09） */
const PAGES = [
  ["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["商品検索結果", 5],
  ["買い物カゴ", 6], ["レビュー一覧", 7], ["レビュー投稿", 8],
  ["お知らせ一覧", 9], ["お知らせ詳細", 10], ["利用案内", 11],
  ["会社概要", 12], ["特定商取引法", 13], ["プライバシー", 14]
];

/* 🔴 会員制・年齢確認（19）は測りません
 *
 *    トップと会員制はプレビューのパスが同じ「/」です。19を出すと、
 *    ルートの描画が19の保存内容に置き換わり、プレビューを押し直しても
 *    戻りません（page_type=2 を保存し直すまで）。測ったあとトップが
 *    ゲートページになるので、ここには入れません。
 *
 *    どうしても測るなら、そのあと必ず
 *      node tools/cdp/paste.js top package/templates/top.tpl html
 */

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const MEASURE = `(function(){
  var d = document.documentElement, b = document.body;
  var w = Math.max(d.scrollWidth, b ? b.scrollWidth : 0);
  var over = [];
  /* 🔴 祖先が overflow で切っているものは、はみ出しではありません
   *    （スライダーの中身を数えていました。2026-09-09） */
  function clipped(e) {
    var n = e.parentElement;
    while (n && n !== d) {
      if (getComputedStyle(n).overflowX !== "visible") { return true; }
      n = n.parentElement;
    }
    return false;
  }
  var all = document.querySelectorAll("body *");
  for (var i = 0; i < all.length; i++) {
    var r = all[i].getBoundingClientRect();
    if (r.width === 0 || r.height === 0) { continue; }
    if (r.right > window.innerWidth + 1 && !clipped(all[i])) {
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
    /* 🔴 前の実行のプレビューURLが残っていると、それを測ってしまいます
     *
     *    押したあと「URLに isp-sp.com が入るまで」待っていました。タブが
     *    **前回のプレビューのまま**だと、その条件は最初から満たされていて、
     *    古いページをそのまま測ります。実際、トップの本文が 52文字
     *    （＝会員制ページの著作権表示だけ）と出ました。
     *    **押す前のURLを控えて、変わるまで**待ちます。 */
    const wasAt = await p.evaluate("location.href");
    await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
    for (let i = 0; i < 30; i++) {
      await sleep(700);
      const now = await p.evaluate("location.href");
      if (now.indexOf("isp-sp.com") >= 0 && now !== wasAt) { break; }
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
