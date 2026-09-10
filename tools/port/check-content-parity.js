/* check-content-parity.js — 現行サイトにあって、移植版に無い文言を出す */
const fs = require("fs");

function decode(buf) {
  let s = buf.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }
  return s;
}

function chunks(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, "\n");
  return body.split("\n")
    .map(s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<")
               .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
               .replace(/\s+/g, " ").trim())
    .filter(s => s.length >= 8);
}

function isProductish(s) {
  if (/^[\d,.\s円個点%％]+$/.test(s)) { return true; }
  if (/^品番[:：]/.test(s)) { return true; }
  if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(s)) { return true; }
  if (/^\[\d{4}\/\d{2}\/\d{2}\]$/.test(s)) { return true; }
  return false;
}

const [livePath, portPath, label] = process.argv.slice(2);
const live = chunks(decode(fs.readFileSync(livePath)));
const port = new Set(chunks(decode(fs.readFileSync(portPath))));
const portJoined = [...port].join("\n");

let skipped = 0;
const missing = [];
const seen = new Set();
for (const c of live) {
  if (seen.has(c)) { continue; }
  seen.add(c);
  if (isProductish(c)) { skipped++; continue; }
  if (port.has(c)) { continue; }
  if (portJoined.indexOf(c) >= 0) { continue; }
  missing.push(c);
}

console.log("── " + (label || livePath));
console.log("   現行の文言 " + seen.size + " 塊 / 商品データとして除外 " + skipped + " / ※ 移植版に無い " + missing.length);
missing.slice(0, 40).forEach(m => console.log("     " + m.slice(0, 100)));
if (missing.length > 40) { console.log("     … 他 " + (missing.length - 40) + " 件"); }

