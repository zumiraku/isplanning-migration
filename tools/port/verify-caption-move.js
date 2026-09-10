/* verify-caption-move.js — 流す予定のCSVが、既存の中身を消さないか */
const fs = require("fs");

const BACKUP = "tools/cdp/csv/20260909181742.csv";
const MOVE = "tools/cdp/csv/move-captions.csv";
const CODE = "システム商品コード";
const TARGET = process.argv[2] || "スマホ商品説明2";

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

function colIndex(head, name) {
  for (let i = 0; i < head.length; i++) { if (head[i].trim() === name) { return i; } }
  return -1;
}

console.log("見る列: " + TARGET);
console.log("読み込み中…");
const back = rows(readSjis(BACKUP));
const move = rows(readSjis(MOVE));
console.log("  控え   " + back.length + " 行 × " + (back[0] ? back[0].length : 0) + " 列");
console.log("  流す分 " + move.length + " 行 × " + (move[0] ? move[0].length : 0) + " 列");

const bCode = colIndex(back[0], CODE), mCode = colIndex(move[0], CODE);
const bVal = colIndex(back[0], TARGET), mVal = colIndex(move[0], TARGET);
if (bCode < 0 || mCode < 0 || bVal < 0 || mVal < 0) {
  console.error("※ 列が見つかりません（" + CODE + " / " + TARGET + "）");
  process.exit(1);
}

const moveBy = new Map();
for (let r = 1; r < move.length; r++) {
  const row = move[r];
  if (!row || row.length <= mVal) { continue; }
  const code = (row[mCode] || "").trim();
  if (code) { moveBy.set(code, row); }
}

let had = 0, kept = 0, lost = 0, absent = 0;
const lostSample = [];
for (let r = 1; r < back.length; r++) {
  const row = back[r];
  if (!row || row.length <= bVal) { continue; }
  const code = (row[bCode] || "").trim();
  const was = (row[bVal] || "").trim();
  if (!code || !was) { continue; }
  had++;
  const found = moveBy.get(code);
  if (!found) { absent++; continue; }
  const now = (found[mVal] || "").trim();
  if (now.indexOf(was) >= 0) { kept++; }
  else {
    lost++;
    if (lostSample.length < 5) {
      lostSample.push({ code: code, was: was.slice(0, 70), now: now.slice(0, 70) });
    }
  }
}

console.log("");
console.log("控えで " + TARGET + " に中身がある商品: " + had + " 件");
console.log("  流す分に入っていて、元の文が残っている : " + kept);
console.log("  流す分に入っておらず、触られない       : " + absent);
console.log("  流す分に入っていて、元の文が消える     : " + lost);
console.log("");
if (lost) {
  console.log("※ 消える例");
  lostSample.forEach(function (x) {
    console.log("   " + x.code);
    console.log("     いま : " + x.was);
    console.log("     流すと: " + x.now);
  });
  console.log("");
  console.log("※ このまま流してはいけません。");
  process.exit(1);
}
console.log("OK 元の文はすべて残ります");

