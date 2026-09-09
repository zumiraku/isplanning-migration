/* ---------------------------------------------------------------------------
   check-content-parity.js — 現行サイトにあって、移植版に無い文言を出す

   🔴 差し戻しの原因はこれでした

      山口様のご指摘21件は、ほぼ全部が「元にあったものを持ってこなかった」
      でした。ヘッダーの文言、左メニュー、コラム、フッターの案内、
      買い物かごの配達日と送料の説明。**どれも、こちらの検査は
      1件も報告しませんでした。** 無いものは検査できないからです。

      だから、現行サイトの文字を1つずつ持って、移植版に有るかを見ます。
      「有るはずのものが有るか」ではなく「**現行に有るものが有るか**」です。

   やりかた

      1. 公開中のページ（ベーシック）から、表示される文字を取る
      2. 移植版のプレビューから、同じく取る
      3. 現行にあって移植版に無い塊を並べる

   🔴 商品名・価格は当然ちがいます

      プレビューは作り物のデータで描いているので、商品まわりは一致しません。
      数字だけの塊と、商品データらしきものは除きます。**除いた数も出します** ──
      黙って減らすと、本当の欠落が見えなくなります。
--------------------------------------------------------------------------- */
const fs = require("fs");

function decode(buf) {
  let s = buf.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }
  return s;
}

/* 表示される文字だけを、意味のある塊で取り出します。 */
function chunks(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, "\n");
  return body.split("\n")
    .map(s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/\s+/g, " ").trim())
    .filter(s => s.length >= 8);
}

/* 商品データらしきもの。プレビューは作り物なので比べても意味がありません。 */
function isProductish(s) {
  if (/^[\d,.\s円個点%％]+$/.test(s)) { return true; }          // 数字と単位だけ
  if (/^品番[:：]/.test(s)) { return true; }
  if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(s)) { return true; }      // 日付
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
  /* 前後の空白や記号の差だけなら一致とみなします */
  if (portJoined.indexOf(c) >= 0) { continue; }
  missing.push(c);
}

console.log("── " + (label || livePath));
console.log("   現行の文言 " + seen.size + " 塊 / 商品データとして除外 " + skipped + " / 🔴 移植版に無い " + missing.length);
missing.slice(0, 40).forEach(m => console.log("     " + m.slice(0, 100)));
if (missing.length > 40) { console.log("     … 他 " + (missing.length - 40) + " 件"); }
