const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const PAGES = [["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["商品検索結果", 5], ["買い物カゴ", 6]];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const CATCH = `(function(){
  window.__errs = [];
  window.addEventListener("error", function (e) {
    window.__errs.push((e.message || "?") + " @ " + (e.filename || "?") + ":" + (e.lineno || 0));
  });
  window.addEventListener("unhandledrejection", function (e) {
    window.__errs.push("promise: " + String(e.reason).slice(0, 120));
  });
  return "armed";
})()`;

const CHECK = `(function(){
  var out = { errors: (window.__errs || []).slice(0, 5) };
  var q = function (s) { return document.querySelector(s); };

  /* こちらのJSが入れる仕掛け */
  out.pageTop     = !!q("p.pageTop a, .pageTop a");
  out.drawerBtn   = !!q(".l-menu-toggle, .l-menu-close");
  out.zoom        = document.querySelectorAll("[data-zoom]").length;
  out.searchInput = !!q("#MakeShopTopSearchInput, #r_searchInput");
  out.searchHook  = !!q('a[href="#makeshop-common-search-url"]');
  out.cartHook    = document.querySelectorAll('a[href^="#makeshop-item-cart-entry-url"]').length;

  /* ヘッダー追従は、スクロールしてクラスが付くかで見ます */
  /* ※ スクロール直後に読んではいけません
   *
   *    scrollTo の直後に className を見ていたので、scroll の処理が走る前に
   *    読んでいました。**全ページで「追従しない」と誤検知**していました。
   *    少し待ってから読みます。 */
  var head = q("#headerWrap");
  out.hasHeader = !!head;
  out.scrollHandlers = "(次のフレームで見ます)";

  /* jQuery はプラットフォームが読ませているか */
  out.jquery = (typeof window.jQuery !== "undefined") ? window.jQuery.fn.jquery : "(無し)";
  return out;
})()`;

(async () => {
  const p = await page();
  let bad = 0;

  for (const [name, type] of PAGES) {
    await p.navigate("about:blank");
    await sleep(400);
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
    }
    const wasAt = await p.evaluate("location.href");
    await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
    let url = "";
    for (let i = 0; i < 30; i++) {
      await sleep(700);
      url = await p.evaluate("location.href");
      if (url.indexOf("isp-sp.com") >= 0 && url !== wasAt) { break; }
    }
    await p.evaluate(CATCH);
    await sleep(3000);
    const r = await p.evaluate(CHECK);
    await sleep(300);
    await p.evaluate("window.scrollTo(0, 400); window.dispatchEvent(new Event(\"scroll\")); 1");
    await sleep(700);
    r.fixedAfterScroll = await p.evaluate(
      '(function(){var h=document.querySelector("#headerWrap");return h ? h.className.indexOf("fixed") >= 0 : false;})()');
    await p.evaluate("window.scrollTo(0, 0); 1");

    const marks = [];
    marks.push("ヘッダー" + (r.hasHeader ? "○" : "※"));
    marks.push("追従" + (r.fixedAfterScroll ? "○" : "※"));
    marks.push("ページトップ" + (r.pageTop ? "○" : "－"));
    marks.push("ドロワー" + (r.drawerBtn ? "○" : "※"));
    marks.push("検索窓" + (r.searchInput ? "○" : "※"));
    marks.push("検索の印" + (r.searchHook ? "○" : "※"));
    if (type === 3) { marks.push("拡大" + (r.zoom ? "○" : "※") + " カート" + (r.cartHook ? "○" : "※")); }
    marks.push("jQuery " + r.jquery);

    const err = r.errors.length;
    if (err) { bad += err; }
    console.log(name.padEnd(14) + (err ? "※ JSエラー " + err + " 件" : "エラー0") + "  " + marks.join(" "));
    r.errors.forEach(e => console.log("      " + e.slice(0, 110)));
    if (!r.hasHeader || !r.searchHook || !r.searchInput) { bad++; }
  }

  p.close();
  console.log("");
  console.log(bad ? "※ 気になるもの " + bad + " 件" : "OK JSエラーなし。仕掛けもすべて入っています");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

