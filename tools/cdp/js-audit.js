/* ---------------------------------------------------------------------------
   js-audit.js — 配信されるページで、JavaScript が実際に動くか

   全ページ共通のJSは保存できています。**動くかどうかは別の話**です。
   ページを開いてコンソールのエラーを拾い、こちらが入れた仕掛けが
   実際に反応するかを確かめます。

     node tools/cdp/js-audit.js

   見るもの
     - JavaScript のエラー（1件でもあると、そこから下が止まります）
     - ヘッダー追従 / ドロワー / 拡大表示 / 検索の Enter
     - プラットフォームの印（検索・カート）が押せる形になっているか
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const PAGES = [["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["商品検索結果", 5], ["買い物カゴ", 6]];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ページ自身に、自分のエラーを集めさせます */
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
    /* ※ トップのプレビューURLは、サイトのルートそのものです
     *
     *      トップ            https://www.isp-sp.com/?ptk=…
     *      会員制・年齢確認   https://www.isp-sp.com/?ptk=…   ← 同じ
     *
     *    直前に別のページ種別をプレビューしていると、タブはすでにその
     *    URLにいます。「isp-sp.com が入るまで」で待つと最初から満たされ、
     *    **前のページを測ります。** トップの本文が 52文字（＝会員制の
     *    著作権表示）と出たのはこれです。いったん空ページへ行って、
     *    タブの状態を必ずリセットします。 */
    await p.navigate("about:blank");
    await sleep(400);
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
    }
    /* ※ 前の実行のプレビューURLが残っていると、それを測ってしまいます
     *
     *    押したあと「URLに isp-sp.com が入るまで」待っていました。タブが
     *    **前回のプレビューのまま**だと、その条件は最初から満たされていて、
     *    古いページをそのまま測ります。実際、トップの本文が 52文字
     *    （＝会員制ページの著作権表示だけ）と出ました。
     *    **押す前のURLを控えて、変わるまで**待ちます。 */
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
    /* ※ window.scrollTo では scroll イベントが出ません
     *
     *    自動操作の scrollTo は位置だけ変えて、**イベントを出しません**
     *    （実測: events 0 / pageYOffset 900）。そのため全ページで
     *    「追従しない」と誤検知していました。**本物のホイール操作**を
     *    送ります。 */
    /* ※ ホイールの送信はやめました
     *
     *    Input.dispatchMouseEvent の mouseWheel は、当たった要素によっては
     *    スクロールしないうえ、**応答が返らずに固まる**ことがありました
     *    （2026-09-10、2回とも10分以上）。
     *
     *    追従の約束は「スクロールされたら fixed を付ける」です。
     *    位置を変えて scroll イベントを出せば、その約束どおりかを
     *    そのまま見られます。実際の利用者がスクロールしたときに
     *    ブラウザが出すのと同じイベントです。 */
    await sleep(300);
    /* ※ ホイールが効かないことがあります
     *
     *    Input.dispatchMouseEvent の mouseWheel は、当たった要素によっては
     *    スクロールしません（スライダーの上など）。実際、全ページで
     *    「追従しない」と出ました。**追従そのものは動いています** ──
     *    scrollTo したあと scroll イベントを出すと fixed が付きます
     *    （tools/cdp/exprs/sticky.js で実測）。
     *
     *    ホイールで動かなかったときは、位置を変えて scroll を出します。
     *    実際の利用者はスクロールすればブラウザが scroll を出すので、
     *    この形で追従の約束どおりかを見られます。 */
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
