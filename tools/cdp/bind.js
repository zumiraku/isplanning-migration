/* ---------------------------------------------------------------------------
   bind.js — 測りたいページを、そのページ種別の設計で描かせます

   ※ /view/…?ptk=… に直接行くと、**別のページの設計**で描かれます

      プレビューは「最後に保存またはプレビューしたページ種別の中身」を
      使い、ページの中身（タイトルや商品名）だけをURLから取ります。
      ポリシーを保存したあとにカテゴリのURLを開くと、**カテゴリのタイトルが
      付いたポリシーページ**が返ります。もっともらしく見えるので、
      気づけません。実際、それに気づかず10ページぶん測っていました。

      測る前に必ずここを通します。エディタを開く → 中身が入るまで待つ →
      プレビューの投稿先（page_path）を差し替える → 送る、の順です。

     const { openAt } = require("./bind.js");
     await openAt(p, 4, "/view/category/ct5");
--------------------------------------------------------------------------- */
const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function openAt(p, type, path, waitMs) {
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    /* ※ previewContent があるだけでは足りません。CodeMirror に中身が
       入る前に押すと、空のHTMLを送って**枠だけのページ**が返ります。 */
    const n = await p.evaluate(
      "(typeof g_editor_object !== 'undefined' && g_editor_object.html_pc)" +
      " ? g_editor_object.html_pc.getValue().length : 0");
    if (n > 200 && await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { ready = true; break; }
  }
  if (!ready) { return { ok: false, why: "エディタが出ません（種別 " + type + "）" }; }

  await p.evaluate(
    "(function(){var f=document.formPreview;" +
    "f.action=f.action.replace(/page_path=.*$/, 'page_path=' + " + JSON.stringify(path) + ");" +
    "f.target='_self'; previewContent(); return 1;})()");

  let url = "";
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    url = await p.evaluate("location.href");
    if (url.indexOf("isp-sp.com") >= 0) { break; }
  }
  if (url.indexOf("isp-sp.com") < 0) { return { ok: false, why: "プレビューに着きません（種別 " + type + "）" }; }
  await sleep(waitMs || 5000);
  return { ok: true, url: url };
}

module.exports = { openAt, sleep };
