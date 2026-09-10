/* diff-detailpages.js — カテゴリ別の商品詳細テンプレート3件が、標準と何が違うか */
const fs = require("fs");
const path = require("path");

const DIR = "templates/basic-export/design/design_detailpages";
const BASE = "templates/basic-export/design/design_detailpage.txt";

function readEuc(f) {
  return new TextDecoder("utf-8").decode(fs.readFileSync(f));
}

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

