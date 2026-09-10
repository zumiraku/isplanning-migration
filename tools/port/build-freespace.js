/* build-freespace.js — カテゴリー別フリースペースをモジュールにする */
const fs = require("fs");
const { rewrite } = require("./url-map.js");

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("使い方: node tools/port/build-freespace.js <カテゴリページのHTML>");
  process.exit(1);
}

const buf = fs.readFileSync(src);
let s = buf.toString("utf8");
if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }

const cat = s.indexOf('id="M_category"');
if (cat < 0) { console.error("※ id=\"M_category\" が見つかりません"); process.exit(1); }
const h2 = s.indexOf("</h2>", cat);
const tbl = s.indexOf('<table class="tbl02"', cat);
if (h2 < 0 || tbl < 0 || tbl <= h2) {
  console.error("※ フリースペースの範囲が取れません（</h2> と <table class=\"tbl02\"> のあいだ）");
  process.exit(1);
}
let block = s.slice(h2 + 5, tbl);

const cut = block.indexOf('<div class="O_ItemLine">');
if (cut >= 0) { block = block.slice(0, cut); }
for (const id of ["O_subCategory", "O_categotyBnr"]) {
  const re = new RegExp('<div id="' + id + '">[\\s\\S]*?</div>', "g");
  block = block.replace(re, "");
}
block = block.trim();

const rw = rewrite(block.split("〜").join("～"));
block = rw.html;
console.log("  URL書き換え " + rw.rewritten + " 本" +
  (rw.missing.length ? " / 対応表に無い " + rw.missing.length + ": " + rw.missing.join(" ") : ""));

if (block.length < 200) {
  console.error("※ 切り出せた中身が短すぎます（" + block.length + " バイト）。目印を確認してください。");
  process.exit(1);
}

const banner = [
  "<{* =========================================================================",
  "     ct646（卓上カレンダー）のカテゴリー別フリースペース",
  "",
  "     ※ クリエイターにフリースペースのタグがありません。",
  "        ベーシックが自動で差し込んでいた部分を、モジュールにしたものです。",
  "        公開ページに出ている実物をそのまま採っています。",
  "",
  "     ※ 休業日カレンダーが入っているので、毎月の更新が要ります。",
  "        左メニューの calendar1 / calendar2 と同じ扱いです。",
  "",
  "     呼び出しは category.tpl の <{if $category.code == 'ct646'}> の中です。",
  "   ========================================================================= *}>"
].join("\n");

fs.writeFileSync("package/modules/freespace_calendar.tpl", banner + "\n" + block + "\n");
console.log("freespace_calendar.tpl  " + block.length + " バイト");
console.log("  休業日カレンダー: " + (block.split("calender_List").length - 1) + " 箇所");

