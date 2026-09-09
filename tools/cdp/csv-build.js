/* ---------------------------------------------------------------------------
   csv-build.js — 商品CSVを作り直す（説明文の移し替え）

     node tools/cdp/csv-build.js <元CSV> <出力> [商品コード…]

   やること

     PC用追加商品説明文  ← 既存 ＋ 画像説明文2（販売単位の表）
     スマホ商品説明2     ← 既存 ＋ 画像説明文3（名入れ料金の表）

   🔴 上書きしません

      PC用追加商品説明文には 1,160商品、スマホ商品説明2には 125商品の
      中身がすでにあります（少量購入の案内、地域限定商品です、など）。
      **消さずに後ろに足します。**

   🔴 移す先はクリエイターモードのタグに対応します

      PC用追加商品説明文 → $item.description2 → Item_detail_caption2
      スマホ商品説明2    → $item.description4 → Item_detail_caption3

      現行サイトの位置と同じところに出ます。

   ⚠️ この2つはベーシックモードでも描画されます（[DETAIL_EXT] と
      スマホ版）。**流すのは「ショップに適用」のあと**にしてください。
      先に流すと、切り替えまでのあいだ表が二重に出ます。
--------------------------------------------------------------------------- */
const fs = require("fs");
const iconv = require("iconv-lite");
const { decode, parse, build } = require("./csv-lib.js");

const src = process.argv[2];
const out = process.argv[3];
const only = process.argv.slice(4);
if (!src || !out) {
  console.error("使い方: node tools/cdp/csv-build.js <元CSV> <出力> [商品コード…]");
  process.exit(1);
}

const rows = parse(decode(fs.readFileSync(src)));
const head = rows[0];
const ix = {};
head.forEach((h, i) => { ix[h] = i; });

const NEED = ["システム商品コード", "画像説明文2", "画像説明文3", "PC用追加商品説明文", "スマホ商品説明2"];
for (const n of NEED) {
  if (ix[n] === undefined) { console.error("🔴 列がありません: " + n); process.exit(1); }
}
const SYS = ix["システム商品コード"], C2 = ix["画像説明文2"], C3 = ix["画像説明文3"];
const EXT = ix["PC用追加商品説明文"], SP2 = ix["スマホ商品説明2"];

const NL = String.fromCharCode(10);
function join(existing, add) {
  const a = (existing || "").trim();
  const b = (add || "").trim();
  if (!b) { return existing || ""; }
  if (!a) { return b; }
  return a + NL + b;
}

const keep = [head];
let touched = 0, appended = 0, skipped = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i].slice();
  if (!r[SYS]) { continue; }
  if (only.length && only.indexOf(r[SYS]) < 0) { continue; }

  const before2 = r[EXT] || "", before4 = r[SP2] || "";
  const after2 = join(before2, r[C2]);
  const after4 = join(before4, r[C3]);
  if (after2 === before2 && after4 === before4) { skipped++; if (!only.length) { continue; } }

  if (before2.trim() && after2 !== before2) { appended++; }
  if (before4.trim() && after4 !== before4) { appended++; }
  r[EXT] = after2;
  r[SP2] = after4;
  keep.push(r);
  touched++;
}

fs.writeFileSync(out, iconv.encode(build(keep), "Shift_JIS"));
console.log("元          : " + src);
console.log("出力        : " + out + "  （" + fs.statSync(out).size + " バイト）");
console.log("書き換えた行 : " + touched);
console.log("追記になった : " + appended + " 箇所（既存の中身は消していません）");
console.log("変化なしで除外: " + skipped);

/* 出したものを読み直して、狙いどおりか確かめます。 */
const chk = parse(decode(fs.readFileSync(out)));
let bad = 0;
for (let i = 1; i < chk.length; i++) {
  const r = chk[i];
  if ((r[C2] || "").trim() && (r[EXT] || "").indexOf((r[C2] || "").trim()) < 0) { bad++; }
  if ((r[C3] || "").trim() && (r[SP2] || "").indexOf((r[C3] || "").trim()) < 0) { bad++; }
}
console.log("読み直しの確認: " + (bad ? "🔴 " + bad + " 箇所が入っていません" : "✅ 全行に入っています"));
