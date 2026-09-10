/* ---------------------------------------------------------------------------
   box-audit.js — ページ種別ごとの CSS / JavaScript 欄に何が残っているか

   ※ ページ種別には HTML のほかに CSS と JavaScript の欄があります

      こちらは HTML 欄しか書き換えていませんでした。**差し戻された版の
      CSS と JavaScript が、ページごとの欄に残っている**可能性があります。

      実際、商品詳細のページで

        Uncaught TypeError: $ is not a function
          @ /view/asset/user-5-1-3-….js

      が出ています。jQuery を前提にしたコードが、ページ種別のJS欄に
      残っていて、jQuery が読まれていないので1行目で落ちています。
      **落ちた時点で、その下は動きません。**

     node tools/cdp/box-audit.js
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const TYPES = [
  [1, "全ページ共通"], [2, "トップ"], [3, "商品詳細"], [4, "商品カテゴリー"],
  [5, "商品検索結果"], [6, "買い物カゴ"], [7, "商品レビュー一覧"], [8, "商品レビュー投稿"],
  [9, "お知らせ一覧"], [10, "お知らせ詳細"], [11, "利用案内"], [12, "会社概要"],
  [13, "特定商取引法"], [14, "プライバシーポリシー"], [18, "まとめ買い割引"], [19, "会員制・年齢確認"]
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const READ = `(function(){
  var out = {};
  ["html", "css", "javascript"].forEach(function (k) {
    var ed = (typeof g_editor_object !== "undefined") ? g_editor_object[k + "_pc"] : null;
    var v = ed ? ed.getValue() : "";
    out[k] = v.length;
    if (k !== "html") { out[k + "_head"] = v.slice(0, 80).replace(/\\s+/g, " "); }
    if (k === "javascript") { out.jq = (v.match(/\\$\\(/g) || []).length; }
  });
  /* スマホ側の欄も見ます */
  ["html", "css", "javascript"].forEach(function (k) {
    var ed = (typeof g_editor_object !== "undefined") ? g_editor_object[k + "_smartphone"] : null;
    out["sp_" + k] = ed ? ed.getValue().length : -1;
  });
  return out;
})()`;

(async () => {
  const p = await page();
  let flagged = 0;
  console.log("種別              HTML    CSS     JS   jQuery呼び出し   スマホ(H/C/J)");
  for (const [t, name] of TYPES) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + t);
    let ok = false;
    for (let i = 0; i < 26 && !ok; i++) {
      await sleep(400);
      ok = !!(await p.evaluate("(typeof g_editor_object !== 'undefined' && Object.keys(g_editor_object).length > 0) ? 1 : 0"));
    }
    if (!ok) { console.log(name.padEnd(16) + "※ 開けません"); continue; }
    const r = await p.evaluate(READ);
    const warn = (r.javascript > 0 && r.jq > 0) || r.css > 0;
    if (warn) { flagged++; }
    console.log(name.padEnd(16) +
      String(r.html).padStart(6) + String(r.css).padStart(7) + String(r.javascript).padStart(7) +
      String(r.jq).padStart(10) + "        " +
      [r.sp_html, r.sp_css, r.sp_javascript].join("/") +
      (warn ? "  ※" : ""));
    if (r.css > 0) { console.log("      CSS : " + r.css_head); }
    if (r.javascript > 0) { console.log("      JS  : " + r.javascript_head); }
  }
  p.close();
  console.log("");
  console.log(flagged ? "※ 中身の残っている欄が " + flagged + " 種別" : "OK ページ種別ごとの CSS / JS 欄は空です");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
