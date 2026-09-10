/* ---------------------------------------------------------------------------
   sp-copy-loss.js — スマホ専用の説明文に、PC版に無い文章があるか（C5）

   ※ 制約台帳で `?` のまま残っていた項目です

      切替後、スマホのお客様は `/smartphone/` へ飛ばなくなり、PCと同じ
      ページを見ます。つまり出るのは **PC用メイン商品説明文** だけです。

      ところが商品データには `スマホ商品説明1` が9,643件すべてに入っていて、
      **そのうち7,553件はPC版と文字列が違います。**

      違うのが「書き方」だけなのか、「PC版に無い文章」があるのかで
      意味がまるで違います。前者なら何も失われません。後者なら
      7,553商品ぶんの文章が、どこにも出なくなります。

      タグを剥がして、文章として比べます。

     node tools/port/sp-copy-loss.js
--------------------------------------------------------------------------- */
const fs = require("fs");

const CSV = "tools/cdp/csv/20260909181742.csv";

function rows(text) {
  const out = [];
  let cur = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { q = false; } }
      else { field += c; }
      continue;
    }
    if (c === '"') { q = true; continue; }
    if (c === ",") { cur.push(field); field = ""; continue; }
    if (c === "\r") { continue; }
    if (c === "\n") { cur.push(field); out.push(cur); cur = []; field = ""; continue; }
    field += c;
  }
  if (field.length || cur.length) { cur.push(field); out.push(cur); }
  return out;
}

/* タグ・空白・記号のゆれを落として、文章だけにします */
function plain(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[\s　]+/g, "")
    .trim();
}

/* 文章を「かたまり」に割ります。行や箇条書きの単位で比べたいので */
function chunks(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .split(/\n+/)
    .map(s => s.replace(/[\s　]+/g, "").trim())
    .filter(s => s.length >= 4);
}

console.log("読み込み中…");
const r = rows(new TextDecoder("shift_jis").decode(fs.readFileSync(CSV)));
const h = r[0].map(x => x.trim());
const iSp = h.findIndex(x => x === "スマホ商品説明1");
const iPc = h.findIndex(x => x === "PC用メイン商品説明文");
const iEx = h.findIndex(x => x === "PC用追加商品説明文");
const iCode = h.findIndex(x => x === "システム商品コード");
if (iSp < 0 || iPc < 0) { console.error("※ 列がありません"); process.exit(1); }

let identical = 0, contained = 0, extra = 0, empty = 0;
let extraChunks = 0;
const sample = [];

for (let k = 1; k < r.length; k++) {
  const row = r[k];
  if (!row) { continue; }
  const sp = row[iSp] || "", pc = row[iPc] || "", ex = (iEx >= 0 ? row[iEx] : "") || "";
  if (!plain(sp)) { empty++; continue; }
  if (plain(sp) === plain(pc)) { identical++; continue; }

  /* PC側（メイン＋追加）に、スマホ側の文が全部入っているか */
  const pcAll = plain(pc) + plain(ex);
  const only = chunks(sp).filter(c => pcAll.indexOf(c) < 0);
  if (!only.length) { contained++; continue; }

  extra++;
  extraChunks += only.length;
  if (sample.length < 8) {
    sample.push({ code: row[iCode], n: only.length, lines: only.slice(0, 3) });
  }
}

console.log("");
console.log("スマホ商品説明1 を持つ商品を、PC側の文章と比べました");
console.log("");
console.log("  文字列まで同じ            " + String(identical).padStart(6));
console.log("  書き方は違うが、文章はPC側にある " + String(contained).padStart(6));
console.log("  PC側に無い文章がある        " + String(extra).padStart(6));
console.log("  スマホ説明が空            " + String(empty).padStart(6));
console.log("");

/* 一覧を書き出します。**機械的に足しません。**
 *
 * 003002000091 はスマホ側に品番が2つあります（UT2216135 と UT2217157）。
 * PC側は UT2217157 だけ。片方が古い可能性があり、機械的に足すと
 * **誤った品番を250商品に載せる**ことになります。
 * 足すかどうかは山口様の判断です。材料だけ出します。 */
const outRows = [["システム商品コード", "PC側に無い文章"]];
for (let k = 1; k < r.length; k++) {
  const row = r[k];
  if (!row) { continue; }
  const sp = row[iSp] || "", pc = row[iPc] || "", ex = (iEx >= 0 ? row[iEx] : "") || "";
  if (!plain(sp) || plain(sp) === plain(pc)) { continue; }
  const only = chunks(sp).filter(c => (plain(pc) + plain(ex)).indexOf(c) < 0);
  if (!only.length) { continue; }
  outRows.push([row[iCode], only.join(" ／ ")]);
}
const q = String.fromCharCode(34);
const csv = outRows.map(cols => cols.map(c => q + String(c).split(q).join(q + q) + q).join(","))
  .join(String.fromCharCode(13, 10));
fs.mkdirSync("inventory", { recursive: true });
fs.writeFileSync("inventory/sp-only-copy.csv", "﻿" + csv);
console.log("一覧: inventory/sp-only-copy.csv（" + (outRows.length - 1) + " 商品）");
console.log("");

if (extra) {
  console.log("※ PC側に出てこない文章が " + extraChunks + " かたまり／" + extra + " 商品");
  console.log("");
  sample.forEach(function (s) {
    console.log("  " + s.code + "  " + s.n + " かたまり");
    s.lines.forEach(l => console.log("     " + l.slice(0, 76)));
  });
} else {
  console.log("OK スマホ専用の文章はありません。切替で失われるものはありません");
}
