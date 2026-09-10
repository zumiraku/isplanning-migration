/* check-class-parity.js — 現行テンプレートの class と id が、移植版にもあるか */
const fs = require("fs");

const D = "templates/basic-export/design/";
const PAIRS = [
  ["トップ", D + "design_mainpage.txt", "package/templates/top.tpl"],
  ["カテゴリ", D + "design_brandpage.txt", "package/templates/category.tpl"],
  ["商品詳細", D + "design_detailpage.txt", "package/templates/detail.tpl"],
  ["検索", D + "design_searchpage.txt", "package/templates/search.tpl"],
  ["買い物かご", D + "design_basketpage.txt", "package/templates/cart.tpl"],
  ["ヘッダー", D + "design_topmenu.txt", "package/modules/header.tpl"],
  ["左メニュー", D + "design_leftmenu.txt", "package/modules/leftmenu.tpl"],
  ["フッター", D + "design_bottom.txt", "package/modules/footer.tpl"]
];

const ALLOW = "inventory/class-parity-allow.tsv";
const allow = new Map();
if (fs.existsSync(ALLOW)) {
  for (const line of fs.readFileSync(ALLOW, "utf8").split("\n")) {
    if (!line.trim() || line.startsWith("#")) { continue; }
    const [page, name, why] = line.split("\t");
    allow.set(page + "\t" + name, why || "");
  }
}

function decode(buf) {
  let s = buf.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }
  return s;
}

function names(file) {
  if (!fs.existsSync(file)) { return null; }
  let s = decode(fs.readFileSync(file));
  s = s.replace(/<!--[\s\S]*?-->/g, " ").replace(/<\{\*[\s\S]*?\*\}>/g, " ");
  const out = { class: {}, id: {} };
  for (const m of s.matchAll(/\bclass="([^"]+)"/g)) {
    m[1].trim().split(/\s+/).forEach(k => { if (k) { out.class[k] = (out.class[k] || 0) + 1; } });
  }
  for (const m of s.matchAll(/\bid="([^"]+)"/g)) {
    const k = m[1].trim();
    if (k && k.indexOf("<{") < 0) { out.id[k] = (out.id[k] || 0) + 1; }
  }
  return out;
}

let missing = 0, allowed = 0;
for (const [label, liveFile, portFile] of PAIRS) {
  const a = names(liveFile), b = names(portFile);
  if (!a || !b) { console.log("※ " + label + " ── ファイルがありません"); continue; }

  const gone = [];
  for (const kind of ["class", "id"]) {
    for (const k of Object.keys(a[kind])) {
      if (b[kind][k]) { continue; }
      const key = label + "\t" + k;
      if (allow.has(key)) { allowed++; continue; }
      gone.push(kind + "=" + k + "（現行 " + a[kind][k] + " 箇所）");
    }
  }
  missing += gone.length;
  console.log((gone.length ? "※ " : "   ") + label.padEnd(12) +
    "現行 class " + Object.keys(a.class).length + " / id " + Object.keys(a.id).length +
    "   移植に無い " + gone.length);
  gone.slice(0, 16).forEach(g => console.log("       " + g));
  if (gone.length > 16) { console.log("       … 他 " + (gone.length - 16) + " 件"); }
}

console.log("");
console.log("理由を書いて除いたもの " + allowed + " 件（" + ALLOW + "）");
console.log(missing ? "※ 移植版に無い class / id が " + missing + " 件あります"
                    : "OK 現行の class と id は、移植版にすべてあります");
if (missing) { process.exit(1); }

