const fs = require("fs");

const BACKUP = "tools/cdp/csv/20260909181742.csv";
const MOVE = "tools/cdp/csv/move-captions.csv";
const CODE = "システム商品コード";

const ALLOWED = ["PC用追加商品説明文", "スマホ商品説明2",
                 "商品特定コード指定", "更新時間フラグ"];

function readSjis(f) {
  if (!fs.existsSync(f)) { console.error("※ ありません: " + f); process.exit(1); }
  return new TextDecoder("shift_jis").decode(fs.readFileSync(f));
}

function rows(text) {
  const out = [];
  let cur = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { q = false; }
      } else { field += c; }
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

console.log("読み込み中…");
const back = rows(readSjis(BACKUP));
const move = rows(readSjis(MOVE));
const bh = back[0], mh = move[0];

if (bh.length !== mh.length) {
  console.log("※ 列数が違います: 控え " + bh.length + " / 流す分 " + mh.length);
  process.exit(1);
}
const headBad = [];
for (let i = 0; i < bh.length; i++) {
  if (bh[i].trim() !== mh[i].trim()) { headBad.push(i + ": " + bh[i] + " → " + mh[i]); }
}
if (headBad.length) {
  console.log("※ 見出しが違う列 " + headBad.length + " 個");
  headBad.slice(0, 10).forEach(s => console.log("   " + s));
  process.exit(1);
}
console.log("列数と見出し: 一致（" + bh.length + " 列）");
console.log("");

const cCode = bh.findIndex(h => h.trim() === CODE);
const backBy = new Map();
for (let r = 1; r < back.length; r++) {
  const row = back[r];
  if (!row || row.length <= cCode) { continue; }
  const code = (row[cCode] || "").trim();
  if (code) { backBy.set(code, row); }
}

const changed = new Array(bh.length).fill(0);
const sample = {};
let compared = 0, missing = 0;
for (let r = 1; r < move.length; r++) {
  const row = move[r];
  if (!row || row.length <= cCode) { continue; }
  const code = (row[cCode] || "").trim();
  const was = backBy.get(code);
  if (!was) { missing++; continue; }
  compared++;
  for (let i = 0; i < bh.length; i++) {
    const a = (was[i] === undefined ? "" : was[i]);
    const b = (row[i] === undefined ? "" : row[i]);
    if (a !== b) {
      changed[i]++;
      if (!sample[i]) {
        sample[i] = { code: code, a: a.slice(0, 50), b: b.slice(0, 50) };
      }
    }
  }
}

console.log("突き合わせた商品: " + compared + " 件 / 控えに無い: " + missing + " 件");
console.log("");
console.log("変わっている列");
let bad = 0;
for (let i = 0; i < bh.length; i++) {
  if (!changed[i]) { continue; }
  const name = bh[i].trim();
  const ok = ALLOWED.indexOf(name) >= 0;
  if (!ok) { bad++; }
  console.log((ok ? "   " : "※ ") + String(i).padStart(3) + "  " + name.padEnd(24) +
    String(changed[i]).padStart(6) + " 件");
  if (!ok && sample[i]) {
    console.log("        " + sample[i].code + "  「" + sample[i].a + "」→「" + sample[i].b + "」");
  }
}
console.log("");
if (bad) {
  console.log("※ 狙っていない列が " + bad + " 個変わっています。流してはいけません");
  process.exit(1);
}
console.log("OK 変わっているのは狙った列だけです");

