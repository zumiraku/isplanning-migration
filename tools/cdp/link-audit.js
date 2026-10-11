const fs = require("fs");
const path = require("path");

const OLD = [
  ["/shopbrand/", "カテゴリ（旧）"],
  ["/shopdetail/", "商品詳細（旧）"],
  ["/html/", "独自ページ・案内（旧）"],
  ["/new/", "お知らせ（旧）"],
  ["/shop/basket.html", "買い物カゴ（旧）"],
  ["/shop/shopbrand.html", "検索の送信先（旧）"]
];

const PLACES = [
  ["ページ種別のテンプレート", "package/templates", ".tpl", true],
  ["モジュール", "package/modules", ".tpl", true],
  ["独自ページ", "tools/cdp/freepage-out", ".tpl", true],
  ["配信されたページ（参考・店舗データ由来）", "tools/cdp/preview-out", ".html", false],
  ["カテゴリの配信ページ（参考・同上）", "tools/cdp/category-out", ".html", false]
];

const SKIP = ["_probe.html"];

let total = 0;
let info = 0;
const detail = [];

for (const [label, dir, ext, ship] of PLACES) {
  if (!fs.existsSync(dir)) { continue; }
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext) && SKIP.indexOf(f) < 0);
  const counts = {};
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), "utf8");
    for (const [needle, name] of OLD) {
      const n = (html.split('href="' + needle).length - 1) +
                (html.split('href="https://www.isp-sp.com' + needle).length - 1) +
                (html.split('href="http://www.isp-sp.com' + needle).length - 1) +
                (html.split('src="' + needle).length - 1);
      if (n) {
        counts[name] = (counts[name] || 0) + n;
        detail.push({ label, file: f, name, n, ship });
      }
    }
  }
  const sum = Object.values(counts).reduce((a, b) => a + b, 0);
  if (ship) { total += sum; } else { info += sum; }
  console.log(label.padEnd(22) + files.length + " ファイル / 旧URL " + sum +
    (sum ? "  " + Object.entries(counts).map(([k, v]) => k + " " + v).join(" / ") : ""));
}

console.log("");
if (info) {
  console.log("参考: 配信されたページに " + info + " 箇所（店舗データ由来。301で転送されます）");
  const by = {};
  detail.filter(d => !d.ship).forEach(d => { const k = d.label + " " + d.file; by[k] = (by[k] || 0) + d.n; });
  Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .forEach(([k, v]) => console.log("   " + String(v).padStart(4) + "  " + k));
  console.log("");
}
if (total) {
  console.log("※ 出荷するものに旧URLが " + total + " 箇所残っています");
  const by = {};
  detail.filter(d => d.ship).forEach(d => { const k = d.label + " " + d.file; by[k] = (by[k] || 0) + d.n; });
  Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .forEach(([k, v]) => console.log("   " + String(v).padStart(4) + "  " + k));
  process.exit(1);
}
console.log("OK 出荷するもの（テンプレート・モジュール・独自ページ）に旧URLはありません");

