/* ---------------------------------------------------------------------------
   build-freespace.js — カテゴリー別フリースペースをモジュールにする

   🔴 クリエイターにフリースペースのタグがありません

      ベーシックでは、カテゴリごとに管理画面で入れた自由なHTMLを
      プラットフォームが商品一覧の上に差し込んでいました。
      design_brandpage.txt にはそのタグすら書かれていません（自動挿入）。
      公式リファレンスの category セクションにも該当タグはありません。

      **移植では、こちらがモジュールとして持つしかありません。**

   いま持つのは ct646（卓上カレンダー）の1件だけです

      この店舗で中身が入っているのを確認できたのがここだけだからです。
      内容は「卓上カレンダーの説明」と「休業日カレンダー2か月分」。
      以前つくった category_calendar.tpl は、こちらが独自のマークアップに
      書き直したもので、CSSも自前でした。**移植の方針に合わないので
      置き換えます** — 公開ページに出ている実物をそのまま採ります。

   🔴 これも毎月の更新が要ります

      中身に休業日カレンダーが入っているためです。左メニューの
      calendar1 / calendar2 と同じ扱いになります。
--------------------------------------------------------------------------- */
const fs = require("fs");

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("使い方: node tools/port/build-freespace.js <カテゴリページのHTML>");
  process.exit(1);
}

const buf = fs.readFileSync(src);
let s = buf.toString("utf8");
if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }

/* フリースペースは、カテゴリ名の <h2> と 商品一覧の <table class="tbl02"> の
   あいだに差し込まれます。両端を目印にして切り出します。

   🔴 起点は「最初の </h2>」ではありません
      ヘッダーにも <h2> があります（「2000年8月オープン！…」）。素朴に
      最初の </h2> から採ったら、ヘッダーごと33KBを持ってきました。
      カテゴリ本体は id="M_category" なので、そこから数えます。 */
const cat = s.indexOf('id="M_category"');
if (cat < 0) { console.error("🔴 id=\"M_category\" が見つかりません"); process.exit(1); }
const h2 = s.indexOf("</h2>", cat);
const tbl = s.indexOf('<table class="tbl02"', cat);
if (h2 < 0 || tbl < 0 || tbl <= h2) {
  console.error("🔴 フリースペースの範囲が取れません（</h2> と <table class=\"tbl02\"> のあいだ）");
  process.exit(1);
}
let block = s.slice(h2 + 5, tbl);

/* サブカテゴリ・カテゴリ画像・件数と並び替えの帯は、テンプレート側が
   出します。フリースペースだけを残します。 */
const cut = block.indexOf('<div class="O_ItemLine">');
if (cut >= 0) { block = block.slice(0, cut); }
for (const id of ["O_subCategory", "O_categotyBnr"]) {
  const re = new RegExp('<div id="' + id + '">[\\s\\S]*?</div>', "g");
  block = block.replace(re, "");
}
block = block.trim();

if (block.length < 200) {
  console.error("🔴 切り出せた中身が短すぎます（" + block.length + " バイト）。目印を確認してください。");
  process.exit(1);
}

const banner = [
  "<{* =========================================================================",
  "     ct646（卓上カレンダー）のカテゴリー別フリースペース",
  "",
  "     🔴 クリエイターにフリースペースのタグがありません。",
  "        ベーシックが自動で差し込んでいた部分を、モジュールにしたものです。",
  "        公開ページに出ている実物をそのまま採っています。",
  "",
  "     🔴 休業日カレンダーが入っているので、毎月の更新が要ります。",
  "        左メニューの calendar1 / calendar2 と同じ扱いです。",
  "",
  "     呼び出しは category.tpl の <{if $category.code == 'ct646'}> の中です。",
  "   ========================================================================= *}>"
].join("\n");

fs.writeFileSync("package/modules/freespace_calendar.tpl", banner + "\n" + block + "\n");
console.log("freespace_calendar.tpl  " + block.length + " バイト");
console.log("  休業日カレンダー: " + (block.split("calender_List").length - 1) + " 箇所");
