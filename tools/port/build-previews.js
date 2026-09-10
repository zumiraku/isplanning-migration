/* build-previews.js — 移植版のプレビューHTMLを作る */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const OUT = "templates/creator/preview";
const FIX = "tools/fixtures";
const MODE = "templates/creator/mode";

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

function merge(base, over) {
  const out = Object.assign({}, base);
  for (const k of Object.keys(over)) {
    const a = out[k], b = over[k];
    out[k] = (a && typeof a === "object" && !Array.isArray(a) &&
              b && typeof b === "object" && !Array.isArray(b))
      ? Object.assign({}, a, b) : b;
  }
  return out;
}

function render(tpl, fixture) {
  const tmp = path.join(process.env.TEMP || "/tmp", "prev-fx-" + Date.now() + ".json");
  fs.writeFileSync(tmp, JSON.stringify(fixture));
  try {
    return execFileSync("node", ["tools/render-smarty.js", tpl, tmp], { encoding: "utf8" });
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {  }
  }
}

const common = readJson(FIX + "/_common.json");

const staticPath = FIX + "/static-pages.json";
if (fs.existsSync(staticPath)) {
  const sp = readJson(staticPath);
  for (const k of Object.keys(sp)) { common[k] = Object.assign({}, common[k], sp[k]); }
}

common.page = Object.assign({}, common.page, {
  css: "../mode/all-pages.css",
  javascript: "../mode/all-pages.js"
});

const modules = ["header", "leftmenu", "footer", "calendar1", "calendar2", "freespace_calendar"];
const rendered = {};
for (const m of modules) {
  const p = "package/modules/" + m + ".tpl";
  if (!fs.existsSync(p)) { console.error("※ モジュールがありません: " + p); process.exit(1); }
  rendered[m] = render(p, common);
}
common.module = Object.assign({}, common.module, rendered);
common.module.leftmenu = render("package/modules/leftmenu.tpl", common);

const PAGES = [
  ["top", "top.tpl", null],
  ["category", "category.tpl", "cat-ct5-full.json"],
  ["detail", "detail.tpl", "item-addimage.json"],
  ["search", "search.tpl", "search-keyword.json"],
  ["cart", "cart.tpl", "cart-two-items.json"],
  ["news-list", "news-list.tpl", "news-list.json"],
  ["news-detail", "news-detail.tpl", "news-detail.json"],
  ["company", "company.tpl", null],
  ["guide", "guide.tpl", null],
  ["contract", "contract.tpl", null],
  ["policy", "policy.tpl", null]
];

fs.mkdirSync(OUT, { recursive: true });

for (const f of fs.readdirSync(OUT)) {
  if (!f.endsWith(".html")) { continue; }
  if (f.startsWith("verify-")) { continue; }
  fs.unlinkSync(path.join(OUT, f));
}

let n = 0;
for (const [name, tpl, fx] of PAGES) {
  const fixture = fx ? merge(common, readJson(FIX + "/" + fx)) : common;
  const html = render(MODE + "/" + tpl, fixture);
  const left = (html.match(/<\{/g) || []).length;
  fs.writeFileSync(path.join(OUT, name + ".html"), html);
  console.log("  " + name.padEnd(14) + String(html.split("\n").length).padStart(4) + " 行" +
              (left ? "   ※ 未展開 " + left : ""));
  n++;
}
console.log("");
console.log(n + " 枚を " + OUT + " に書き出しました（出荷するテンプレートを描画したものです）");

