/* scan-product-html.js — 商品説明文9,643件の中身を調べます */
const fs = require("fs");

const FILE = "tools/cdp/csv/20260909181742.csv";

if (!fs.existsSync(FILE)) {
  console.error("※ 商品CSVがありません: " + FILE);
  process.exit(1);
}

const buf = fs.readFileSync(FILE);
let text;
try { text = new TextDecoder("shift_jis").decode(buf); }
catch (e) { console.error("※ Shift_JIS を読めません: " + e.message); process.exit(1); }

const PATTERNS = [
  ["jQuery を使う", /jQuery\s*\(|\$\s*\(\s*function|\$\s*\(\s*document|\$\s*\(\s*['"]/g],
  ["自前で jQuery を読む", /jquery[.-][^"']*\.js/gi],
  ["ベーシックのタグ", /\[[A-Z_][A-Z_0-9]{3,}\]/g],
  ["/smartphone/ へのリンク", /\/smartphone\//g],
  ["旧URL /shopdetail/", /\/shopdetail\//g],
  ["旧URL /shopbrand/", /\/shopbrand\//g],
  ["旧URL /html/", /\/html\//g],
  ["絶対URL（自サイト）", /https?:\/\/www\.isp-sp\.com/g],
  ["iframe", /<iframe/gi],
  ["document.write", /document\.write/g],
  ["style 属性の固定幅", /style="[^"]*width\s*:\s*\d{3,}px/gi],
  ["table の width 属性", /<table[^>]+width\s*=\s*["']?\d{3,}/gi]
];

const lines = text.split("\n");
console.log("商品CSV: " + lines.length + " 行 / " + Math.round(buf.length / 1024 / 1024) + " MB");
console.log("");

const head = (lines[0] || "").split(",").map(s => s.replace(/^"|"$/g, ""));
const cols = [];
head.forEach(function (h, i) {
  if (/説明|キャプション|コメント/.test(h)) { cols.push([i, h]); }
});
console.log("説明文らしき列 " + cols.length + " 個");
cols.forEach(([i, h]) => console.log("   " + String(i).padStart(2) + "  " + h));
console.log("");

const tally = {};
const sample = {};
for (const [label] of PATTERNS) { tally[label] = 0; sample[label] = []; }
let rows = 0;

for (const [label, re] of PATTERNS) {
  re.lastIndex = 0;
  const m = text.match(re);
  tally[label] = m ? m.length : 0;
  if (m) { sample[label] = [...new Set(m)].slice(0, 6); }
}

console.log("見つかったもの（CSV全体での出現数）");
console.log("");
for (const [label] of PATTERNS) {
  const n = tally[label];
  console.log((n ? "※ " : "   ") + label.padEnd(26) + String(n).padStart(7));
  if (n && sample[label].length) {
    console.log("      例: " + sample[label].map(s => s.slice(0, 34)).join(" / "));
  }
}

