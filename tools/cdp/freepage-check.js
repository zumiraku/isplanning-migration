/* ---------------------------------------------------------------------------
   freepage-check.js — 作った82枚が、現行の文言を落としていないか

     node tools/cdp/freepage-check.js

   本文を切り出すときに切りすぎていないか、機械で見ます。
   **「無いものは検査できない」**が差し戻しの原因だったので、
   現行の文言を1つずつ持ってきて、移植版に有るかを数えます。
--------------------------------------------------------------------------- */
const fs = require("fs");

const SRC = "tools/cdp/freepage-src";
const OUT = "tools/cdp/freepage-out";

function read(p) {
  const b = fs.readFileSync(p);
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); }
  return s;
}

/* 画面に出る文字だけを塊で取り出します */
function chunks(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, "\n");
  return body.split("\n")
    .map(s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
               .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
               /* ※ 16進の実体参照（&#x1F449; など）も戻します。
                *    10進だけ見ていて、絵文字の行を丸ごと「欠落」と誤検知しました。 */
               .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
               /* ※ 名前付きの実体参照も戻します。&raquo; を残していたので、
                *    ページ送りの「次の40件 »」を毎回「欠落」と数えていました。 */
               .replace(/&raquo;/g, "»").replace(/&laquo;/g, "«")
               .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'")
               /* ※ 波ダッシュは移植で ～(U+FF5E) に揃えています。
                *    現行は 〜(U+301C) なので、揃えないと同じ文が別物に見えます。 */
               .split("〜").join("～")
               .replace(/\s+/g, " ").trim())
    .filter(s => s.length >= 8);
}

/* ※ head は比べません
 *
 *    <title> は移植版も持っていますが、meta description は
 *    `$page.description` になります（管理画面の値が入ります）。
 *    head を混ぜると、出るはずのないものを「欠落」と数えます。 */
function bodyOnly(html) {
  const at = html.search(/<body\b/i);
  return at < 0 ? html : html.slice(at);
}

const lines = fs.readFileSync("tools/cdp/freepage-ids.txt", "utf8").split("\n").filter(Boolean);

/* ※ 共通部分は「2枚の共通」では足りません
 *
 *    ヘッダー・左メニュー・フッター・コラム一覧は全ページに出ます。
 *    最初は2枚の共通で判定していて、コラムの見出しを「本文の欠落」と
 *    数えていました。**82枚を数えて、半分以上に出るものを共通**とします。 */
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
  /* ※ 両側を同じに整えてから比べます
   *
   *    現行側だけ空白を詰めて、移植側は**生のHTML**に対して探していました。
   *    `<br />` や全角空白をまたぐ文が、入っているのに「無い」と出ます。
   *    page7 で13塊、実際は全部入っていました。 */
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
