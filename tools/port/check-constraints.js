/* check-constraints.js — 制約台帳で `?` のまま残っている項目を、実データで答えます */
const fs = require("fs");
const path = require("path");

const CSV = "tools/cdp/csv/20260909181742.csv";

function readSjis(f) { return new TextDecoder("shift_jis").decode(fs.readFileSync(f)); }

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

console.log("商品CSVを読み込み中…");
const r = rows(readSjis(CSV));
const head = r[0].map(h => h.trim());
console.log("  " + (r.length - 1) + " 商品 × " + head.length + " 列");
console.log("");

function col(name) { return head.findIndex(h => h === name); }
function countNonEmpty(i) {
  if (i < 0) { return -1; }
  let n = 0;
  for (let k = 1; k < r.length; k++) {
    const row = r[k];
    if (row && row.length > i && String(row[i]).trim()) { n++; }
  }
  return n;
}


console.log("■ 商品データから");
const SPOTS = [
  ["C5  スマホ商品説明1", "スマホ商品説明1"],
  ["C5  スマホ商品説明2", "スマホ商品説明2"],
  ["C6  追加画像レイアウト", "追加画像レイアウト"],
  ["C7  一発購入", "一発購入"],
  ["    商品カテゴリー用商品説明文（対応済）", "商品カテゴリー用商品説明文"]
];
for (const [label, name] of SPOTS) {
  const i = col(name);
  if (i < 0) {
    const near = head.filter(h => h.indexOf(name.slice(0, 4)) >= 0);
    console.log("  " + label.padEnd(28) + "列が無い" +
      (near.length ? "（近い名前: " + near.join(" / ") + "）" : ""));
    continue;
  }
  const n = countNonEmpty(i);
  console.log("  " + label.padEnd(28) + (n ? "※ 使用 " + n + " 件" : "OK 未使用"));
}

console.log("");
console.log("■ 中身のある列（85列のうち）");
const used = [];
for (let i = 0; i < head.length; i++) {
  const n = countNonEmpty(i);
  if (n > 0) { used.push([head[i], n]); }
}
console.log("  " + used.length + " 列に中身があります");
used.forEach(([h, n]) => console.log("    " + h.padEnd(30) + String(n).padStart(6)));

console.log("");
console.log("■ 配信ページから");
const DIR = "tools/cdp/preview-out";
const MARKS = [
  ["C9  投票", /投票|アンケート結果|vote/i],
  ["C9  懸賞", /懸賞|プレゼント応募/],
  ["C11 RSS", /rss|feed\.xml/i],
  ["C12 レビュー枠", /u-komi|review-container/i]
];
if (fs.existsSync(DIR)) {
  const all = fs.readdirSync(DIR).filter(f => f.endsWith(".html"))
    .map(f => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n");
  for (const [label, re] of MARKS) {
    const m = all.match(re);
    console.log("  " + label.padEnd(28) + (m ? "※ あり（" + m[0].slice(0, 20) + "）" : "OK 無し"));
  }
}

