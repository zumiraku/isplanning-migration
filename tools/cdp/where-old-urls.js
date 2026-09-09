/* ---------------------------------------------------------------------------
   where-old-urls.js — 配信ページに残る旧URLが、どこから来ているか

   テンプレートもモジュールも旧URLは0件です。それでも配信されたページには
   残っています。**管理画面のデータ側（スライダーのバナー、会社概要の本文、
   商品説明）から来ているのか**を確かめます。データ側なら、こちらの
   テンプレートでは直せません（301で飛ぶので壊れはしません）。

     node tools/cdp/where-old-urls.js
--------------------------------------------------------------------------- */
const fs = require("fs");

const FILES = [
  ["トップ", "tools/cdp/preview-out/top.html"],
  ["会社概要", "tools/cdp/preview-out/company.html"],
  ["商品詳細", "tools/cdp/preview-out/detail.html"],
  ["商品カテゴリー", "tools/cdp/preview-out/category.html"]
];

/* だいたいの居場所を、近くの目印で当てます */
const ZONES = [
  ['class="slider"', "スライダー（管理画面のバナー）"],
  ['id="O_adminPagearea"', "本文（管理画面の文章）"],
  ['class="Item_detail_txt"', "商品説明（商品データ）"],
  ['id="Item_detail_caption', "商品説明の追加欄（商品データ）"],
  ['id="colum-wrap"', "フッターのコラム（こちらのモジュール）"],
  ['id="footer_guideWrap"', "フッターのご案内（こちらのモジュール）"],
  ['id="M_leftContents"', "左メニュー（こちらのモジュール）"],
  ['id="headerWrap"', "ヘッダー（こちらのモジュール）"],
  ['class="rcmdjp', "レコメンド（プラットフォーム）"]
];

const OLD = /(?:href|src)="((?:https?:\/\/www\.isp-sp\.com)?\/(?:shopbrand|shopdetail|html|new)\/[^"]*)"/g;

for (const [name, file] of FILES) {
  if (!fs.existsSync(file)) { continue; }
  const html = fs.readFileSync(file, "utf8");
  const zonePos = ZONES.map(([mark, label]) => [html.indexOf(mark), label]).filter(z => z[0] >= 0);
  zonePos.sort((a, b) => a[0] - b[0]);

  const tally = {};
  let m;
  OLD.lastIndex = 0;
  while ((m = OLD.exec(html))) {
    let where = "（どの区画でもない）";
    for (const [at, label] of zonePos) { if (at < m.index) { where = label; } }
    tally[where] = (tally[where] || 0) + 1;
  }
  const sum = Object.values(tally).reduce((a, b) => a + b, 0);
  console.log(name.padEnd(14) + "旧URL " + String(sum).padStart(4));
  Object.entries(tally).sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log("      " + String(v).padStart(4) + "  " + k));
}
