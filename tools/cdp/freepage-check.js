const fs = require("fs");

const SRC = "tools/cdp/freepage-src";
const OUT = "tools/cdp/freepage-out";

function read(p) {
  const b = fs.readFileSync(p);
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); }
  return s;
}

function chunks(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, "\n");
  return body.split("\n")
    .map(s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
               .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
               .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
               .replace(/&raquo;/g, "»").replace(/&laquo;/g, "«")
               .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'")
               .split("〜").join("～")
               .replace(/\s+/g, " ").trim())
    .filter(s => s.length >= 8);
}

function bodyOnly(html) {
  const at = html.search(/<body\b/i);
  return at < 0 ? html : html.slice(at);
}

const lines = fs.readFileSync("tools/cdp/freepage-ids.txt", "utf8").split("\n").filter(Boolean);

const seen = new Map();
for (const line of lines) {
  const pageId = line.split(" ")[1];
  const at = SRC + "/" + pageId;
  if (!fs.existsSync(at)) { continue; }
  new Set(chunks(bodyOnly(read(at)))).forEach(c => seen.set(c, (seen.get(c) || 0) + 1));
}
const COMMON = new Set([...seen.entries()].filter(([, n]) => n >= 41).map(([c]) => c));
console.log("全ページに出る共通の文言: " + COMMON.size + " 塊（比べる対象から外します）");
console.log("");
let worst = [], totalMissing = 0, checked = 0;

for (const line of lines) {
  const pageId = line.split(" ")[1];
  const a = SRC + "/" + pageId, b = OUT + "/" + pageId + ".tpl";
  if (!fs.existsSync(a) || !fs.existsSync(b)) { continue; }
  const live = chunks(bodyOnly(read(a))).filter(c => !COMMON.has(c));
  const mine = chunks(read(b)).join(" ");
  const missing = live.filter(c => mine.indexOf(c) < 0);
  checked++;
  totalMissing += missing.length;
  if (missing.length) { worst.push({ pageId, live: live.length, missing: missing.length, sample: missing.slice(0, 3) }); }
}

worst.sort((a, b) => b.missing - a.missing);
console.log("調べた " + checked + " 枚 / 欠落のあるページ " + worst.length + " 枚 / 欠落の合計 " + totalMissing);
console.log("");
worst.slice(0, 12).forEach(w => {
  console.log(w.pageId + "  現行 " + w.live + " 塊 / 欠落 " + w.missing);
  w.sample.forEach(s => console.log("    " + s.slice(0, 90)));
});
if (!worst.length) { console.log("OK 82枚とも、現行の文言をすべて持っています"); }

