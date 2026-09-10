/* freepage-width.js — 独自ページ82枚に、はみ出しそうな固定幅がないか */
const fs = require("fs");

const DIR = "tools/cdp/freepage-out";
const COLUMN = 990;

const rows = [];
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith(".tpl")) { continue; }
  const html = fs.readFileSync(DIR + "/" + f, "utf8");
  const hits = [];

  for (const m of html.matchAll(/width\s*=\s*"?(\d{3,4})"?/gi)) {
    const n = Number(m[1]);
    if (n > COLUMN) { hits.push('width=' + n); }
  }
  for (const m of html.matchAll(/(?:min-)?width\s*:\s*(\d{3,4})px/gi)) {
    const n = Number(m[1]);
    if (n > COLUMN) { hits.push(m[0]); }
  }
  if (hits.length) {
    rows.push({ file: f.replace(/\.tpl$/, ""), hits: [...new Set(hits)] });
  }
}

rows.sort((a, b) => b.hits.length - a.hits.length);
console.log("調べた " + fs.readdirSync(DIR).filter(f => f.endsWith(".tpl")).length + " 枚 / " +
  COLUMN + "px を超える固定幅がある " + rows.length + " 枚");
console.log("");
rows.slice(0, 12).forEach(r => console.log("  " + r.file.padEnd(16) + r.hits.slice(0, 6).join("  ")));
if (!rows.length) { console.log("OK 本文の列（" + COLUMN + "px）を超える固定幅はありません"); }

