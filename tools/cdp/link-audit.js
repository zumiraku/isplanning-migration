/* ---------------------------------------------------------------------------
   link-audit.js — 切り替え後に壊れるリンクが残っていないか

   ベーシックのURL（/shopbrand/ /shopdetail/ /html/ /new/）が残っていると、
   切り替え後は301で回るか、404になります。**配信されたHTMLと、
   これから配信されるテンプレートの両方**を見ます。

     node tools/cdp/link-audit.js

   ※ 「テンプレートを直したから大丈夫」では足りません

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

/* 見る場所
 *
 *   ※ 「出荷するもの」と「配信されたページ」を分けます（2026-09-09）
 *
 *      配信されたページに残る旧URLは、**店舗のデータ**から来ます。
 *      商品説明文だけで 9,635商品・65,854箇所あります（実測）。
 *      こちらのテンプレートでは直せませんし、直すものでもありません。
 *      プラットフォームが301で転送します（2026-09-08 実測、旧URL 8本すべて200）。
 *
 *      混ぜて数えていたので、出荷物が全部きれいでも赤で終わっていました。
 *      **止めるのは出荷物だけ**にして、配信ページは参考として出します。 */
const PLACES = [
  ["ページ種別のテンプレート", "package/templates", ".tpl", true],
  ["モジュール", "package/modules", ".tpl", true],
  ["独自ページ", "tools/cdp/freepage-out", ".tpl", true],
  ["配信されたページ（参考・店舗データ由来）", "tools/cdp/preview-out", ".html", false],
  ["カテゴリの配信ページ（参考・同上）", "tools/cdp/category-out", ".html", false]
];

/* probe.js が残す作業ファイルは配信物ではありません */
const SKIP = ["_probe.html"];

let total = 0;      /* 出荷物だけ。ここが0でなければ止めます */
let info = 0;       /* 配信ページ側。参考値 */
const detail = [];

for (const [label, dir, ext, ship] of PLACES) {
  if (!fs.existsSync(dir)) { continue; }
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext) && SKIP.indexOf(f) < 0);
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
