/* ---------------------------------------------------------------------------
   link-audit.js — 切り替え後に壊れるリンクが残っていないか

   ベーシックのURL（/shopbrand/ /shopdetail/ /html/ /new/）が残っていると、
   切り替え後は301で回るか、404になります。**配信されたHTMLと、
   これから配信されるテンプレートの両方**を見ます。

     node tools/cdp/link-audit.js

   🔴 「テンプレートを直したから大丈夫」では足りません

      モジュールにも独自ページにも、お店が書いたリンクが山ほど入っています。
      1箇所ずつ数えます。
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");

/* ベーシック時代のURLの形 */
const OLD = [
  ["/shopbrand/", "カテゴリ（旧）"],
  ["/shopdetail/", "商品詳細（旧）"],
  ["/html/", "独自ページ・案内（旧）"],
  ["/new/", "お知らせ（旧）"],
  ["/shop/basket.html", "買い物カゴ（旧）"],
  ["/shop/shopbrand.html", "検索の送信先（旧）"]
];

/* 見る場所 */
const PLACES = [
  ["配信されたページ", "tools/cdp/preview-out", ".html"],
  ["カテゴリの配信ページ", "tools/cdp/category-out", ".html"],
  ["ページ種別のテンプレート", "package/templates", ".tpl"],
  ["モジュール", "package/modules", ".tpl"],
  ["独自ページ", "tools/cdp/freepage-out", ".tpl"]
];

let total = 0;
const detail = [];

for (const [label, dir, ext] of PLACES) {
  if (!fs.existsSync(dir)) { continue; }
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext));
  const counts = {};
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), "utf8");
    for (const [needle, name] of OLD) {
      /* 現行サイトを指す絶対URLも数えます */
      const n = (html.split('href="' + needle).length - 1) +
                (html.split('href="https://www.isp-sp.com' + needle).length - 1) +
                (html.split('href="http://www.isp-sp.com' + needle).length - 1) +
                (html.split('src="' + needle).length - 1);
      if (n) {
        counts[name] = (counts[name] || 0) + n;
        detail.push({ label, file: f, name, n });
      }
    }
  }
  const sum = Object.values(counts).reduce((a, b) => a + b, 0);
  total += sum;
  console.log(label.padEnd(22) + files.length + " ファイル / 旧URL " + sum +
    (sum ? "  " + Object.entries(counts).map(([k, v]) => k + " " + v).join(" / ") : ""));
}

console.log("");
if (total) {
  console.log("🔴 旧URLが " + total + " 箇所残っています");
  const by = {};
  detail.forEach(d => { const k = d.label + " " + d.file; by[k] = (by[k] || 0) + d.n; });
  Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .forEach(([k, v]) => console.log("   " + String(v).padStart(4) + "  " + k));
  process.exit(1);
}
console.log("✅ 旧URLは1箇所も残っていません");
