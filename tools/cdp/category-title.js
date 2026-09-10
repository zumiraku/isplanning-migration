/* category-title.js — カテゴリ独自タイトルをモジュールにする */
const fs = require("fs");

const SRC = "tools/cdp/category-src";
const MAP = "package/url-bulk/categories-url.csv";
const NL = String.fromCharCode(10);

function read(p) {
  const b = fs.readFileSync(p);
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); }
  return s;
}

const codes = [];
for (const r of fs.readFileSync(MAP, "utf8").split("\n")) {
  const m = r.match(/\/view\/category\/(ct\d+)/);
  if (m) { codes.push(m[1]); }
}

const found = [];
let missing = 0;
for (const code of codes) {
  const at = SRC + "/" + code + ".html";
  if (!fs.existsSync(at)) { missing++; continue; }
  const html = read(at);
  const body = html.slice(html.search(/<body\b/i));
  const hs = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)]
    .map(m => m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
  const title = hs.find(t => t && t.indexOf("2000年8月オープン") < 0 && t.indexOf("粗品選びは") < 0);
  if (!title) { missing++; continue; }
  found.push({ code, title: title.split("〜").join("～") });
}

const by = new Map();
for (const f of found) {
  if (!by.has(f.title)) { by.set(f.title, []); }
  by.get(f.title).push(f.code);
}

const head = [
  "<{* ==========================================================================",
  "     カテゴリ独自タイトル — ベーシックの [NAMECURRENT] の中身",
  "",
  "     ※ $category.name は登録名しか返しません。現行はカテゴリごとの",
  "        独自タイトルを出しています（「～49円」→「～49円（予算別粗品　税別単価）」）。",
  "",
  "     生成物です。直すときは tools/cdp/category-title.js を直してください。",
  "   ========================================================================== *}>"
].join(NL);

const units = [...by.entries()].map(([title, cs]) =>
  "<{if " + cs.map(c => "$category.code == '" + c + "'").join(" or ") + "}>" + title + "<{/if}>");

const LIMIT = 70000;
const parts = [];
let cur = [], size = 0;
for (const u of units) {
  if (size + u.length > LIMIT && cur.length) { parts.push(cur); cur = []; size = 0; }
  cur.push(u); size += u.length + 1;
}
if (cur.length) { parts.push(cur); }

parts.forEach((part, i) => {
  const name = "category_title" + (i + 1);
  fs.writeFileSync("package/modules/" + name + ".tpl", head + NL + part.join(NL) + NL);
  console.log("  " + name.padEnd(18) + String(part.length).padStart(4) + " 種類  " +
    String(fs.statSync("package/modules/" + name + ".tpl").size).padStart(7) + " バイト");
});

console.log("");
console.log("見出しが取れたカテゴリ " + found.length + " / 取れない " + missing + " / 種類 " + by.size);
console.log("テンプレートから: " + parts.map((p, i) => "<{$module.category_title" + (i + 1) + "}>").join(""));

