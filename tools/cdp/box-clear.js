/* ---------------------------------------------------------------------------
   box-clear.js — ページ種別ごとの CSS / JavaScript 欄を空にする

     node tools/cdp/box-clear.js 2 3 6 18 19

   🔴 HTML欄しか書き換えていませんでした

      ページ種別には HTML のほかに CSS と JavaScript の欄があります。
      差し戻された版のコードが5種別に残っていました。

        トップ            CSS  681
        商品詳細          CSS 4310 ＋ JS 1090（jQuery呼び出し13回）
        買い物カゴ         CSS  482
        まとめ買い割引      CSS   38
        会員制・年齢確認    CSS  443

      商品詳細のJSは `$(function(){…}` で始まり、jQuery が読まれていないので
      **1行目で落ちます**。配信ページのコンソールに
      `Uncaught TypeError: $ is not a function` が出ていました。

      CSSのほうは、もう存在しないクラス（.bulk / .item-image-small /
      .contents-section）を狙っています。当たらないだけで、**残しておく
      理由がありません。**

   ⚠️ 全ページ共通（page_type=1）は触りません。こちらのCSS・JSが入っています。
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

const types = process.argv.slice(2).map(Number).filter(Boolean);
if (!types.length) { console.error("使い方: node tools/cdp/box-clear.js <page_type…>"); process.exit(1); }
if (types.indexOf(1) >= 0) { console.error("🔴 全ページ共通（1）は空にできません。こちらのCSS・JSが入っています。"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  let ng = 0;
  for (const t of types) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + t);
    let ok = false;
    for (let i = 0; i < 26 && !ok; i++) {
      await sleep(400);
      ok = !!(await p.evaluate("(typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0"));
    }
    if (!ok) { console.log(String(t).padStart(3) + "  🔴 開けません"); ng++; continue; }

    const before = await p.evaluate(`(function(){
      return { css: g_editor_object.css_pc.getValue().length,
               js: g_editor_object.javascript_pc.getValue().length };
    })()`);
    if (!before.css && !before.js) { console.log(String(t).padStart(3) + "  すでに空です"); continue; }

    await p.evaluate(`(function(){
      g_editor_object.css_pc.setValue("");
      g_editor_object.javascript_pc.setValue("");
      window.confirm = function(){ return true; };
      saveContent();
      return 1;
    })()`);
    await sleep(4500);

    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + t);
    ok = false;
    for (let i = 0; i < 26 && !ok; i++) {
      await sleep(400);
      ok = !!(await p.evaluate("(typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0"));
    }
    const after = ok ? await p.evaluate(`(function(){
      return { css: g_editor_object.css_pc.getValue().length,
               js: g_editor_object.javascript_pc.getValue().length,
               html: g_editor_object.html_pc.getValue().length };
    })()`) : null;

    if (after && !after.css && !after.js) {
      console.log(String(t).padStart(3) + "  ✅ CSS " + before.css + "→0 / JS " + before.js + "→0  （HTMLは " + after.html + " 文字のまま）");
    } else {
      console.log(String(t).padStart(3) + "  🔴 空になっていません " + JSON.stringify(after));
      ng++;
    }
  }
  p.close();
  console.log("");
  console.log(ng ? "🔴 " + ng + " 件が通っていません" : "✅ 指定した欄はすべて空になりました");
  if (ng) { process.exit(1); }
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
