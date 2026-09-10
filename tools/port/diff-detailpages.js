/* ---------------------------------------------------------------------------
   diff-detailpages.js — カテゴリ別の商品詳細テンプレート3件が、標準と何が違うか

   ※ 制約台帳に `YES ※` のまま残っていました（C28）

      ベーシックには、カテゴリごとの商品詳細テンプレートが3件あります。

        design_detailpage_ct261.txt   17,978 バイト
        design_detailpage_ct646.txt    8,536 バイト
        design_detailpage_ct664.txt   17,746 バイト
        design_detailpage.txt（標準）  18,299 バイト

      移植では**標準の1枚しか見ていません。** この3カテゴリの商品ページに
      標準と違う中身があるなら、切り替えでその分が消えます。
      「たぶん同じ」で済ませず、行単位で比べます。

     node tools/port/diff-detailpages.js
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");

const DIR = "templates/basic-export/design/design_detailpages";
const BASE = "templates/basic-export/design/design_detailpage.txt";

/* ※ このフォルダは UTF-8 です
 *    ベーシックは EUC-JP と聞いていたので euc-jp で読み、文字化けしました。
 *    実測: euc-jp 431 / shift_jis 1,274 / utf-8 1,136 文字。数だけでは決まらず、
 *    化け方（繝帙・繝ｼ繝＝UTF-8をShift_JISで読んだ形）を見て UTF-8 と判定しました。 */
function readEuc(f) {
  return new TextDecoder("utf-8").decode(fs.readFileSync(f));
}

/* 空白と改行の揺れは無視して、意味のある行だけ並べます */
function meaningful(text) {
  return text.split(/\r?\n/)
    .map(s => s.replace(/[\t ]+/g, " ").trim())
    .filter(Boolean);
}

if (!fs.existsSync(BASE)) { console.error("※ 標準がありません: " + BASE); process.exit(1); }
const base = meaningful(readEuc(BASE));
const baseSet = new Set(base);

console.log("標準: " + base.length + " 行");
console.log("");

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith(".txt"))) {
  const lines = meaningful(readEuc(path.join(DIR, f)));
  const set = new Set(lines);
  const onlyHere = lines.filter(l => !baseSet.has(l));
  const missing = base.filter(l => !set.has(l));

  console.log("========== " + f + "   " + lines.length + " 行");
  console.log("  標準に無い行 " + onlyHere.length + " / 標準にあって無い行 " + missing.length);

  if (onlyHere.length) {
    console.log("  ── このカテゴリだけにあるもの（先頭12行）");
    onlyHere.slice(0, 12).forEach(l => console.log("     " + l.slice(0, 96)));
  }
  if (missing.length) {
    console.log("  ── 標準にあって、このカテゴリには無いもの（先頭8行）");
    missing.slice(0, 8).forEach(l => console.log("     " + l.slice(0, 96)));
  }
  console.log("");
}
