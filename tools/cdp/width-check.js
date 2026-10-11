const { page } = require("./cdp.js");

const WIDTHS = [320, 375, 414, 768, 960, 1280];
const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const PAGES = [
  ["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["商品検索結果", 5],
  ["買い物カゴ", 6], ["レビュー一覧", 7], ["レビュー投稿", 8],
  ["お知らせ一覧", 9], ["お知らせ詳細", 10], ["利用案内", 11],
  ["会社概要", 12], ["特定商取引法", 13], ["プライバシー", 14]
];


function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const MEASURE = `(function(){
  var d = document.documentElement, b = document.body;
  var w = Math.max(d.scrollWidth, b ? b.scrollWidth : 0);
  var over = [];
  /* ※ 祖先が overflow で切っているものは、はみ出しではありません
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
    if (!ok) { console.log(name + " ※ エディタが出ません"); continue; }
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
      line.push(w + (bad ? "※" + r.scroll : "○"));
      if (bad) { console.log("    " + name + " " + w + "px はみ出し " + r.scroll + " : " + r.over.join(" / ")); }
    }
    console.log(name.padEnd(14) + line.join("  "));
  }

  await p.send("Emulation.clearDeviceMetricsOverride");
  p.close();
  console.log("");
  console.log(ng ? "※ はみ出し " + ng + " 件" : "OK どの幅でも横にはみ出していません");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

