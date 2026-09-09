/* ---------------------------------------------------------------------------
   category-check.js — カテゴリごとの独自内容が、移行後も出るか

   ベーシックには53のカテゴリテンプレートがあり、カテゴリごとに違う
   説明文やバナーが入っています。クリエイターモードのカテゴリは**1枚**です。
   **カテゴリ別の中身が落ちていないか**を、実際に配信されるページで見ます。

     node tools/cdp/category-check.js

   プレビューは押した種別に固定されるので、カテゴリのプレビューを押してから
   URLだけ差し替えて回ります。
--------------------------------------------------------------------------- */
const fs = require("fs");
const https = require("https");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const OUT = "tools/cdp/category-out";

/* 現行URL → 移行後URL。カレンダー・季節・予算など、性格の違うものを選びました。 */
const CATS = [
  ["ct646", "/shopbrand/051/O/", "/view/category/ct646"],
  ["ct5", "/shopbrand/003/001/X/", "/view/category/ct5"],
  ["ct22", "/shopbrand/005/Y/", "/view/category/ct22"],
  ["ct29", "/shopbrand/006/001/Y/", "/view/category/ct29"],
  ["ct667", "/shopbrand/ct667/", "/view/category/ct667"],
  ["ct306", "/shopbrand/026/Y/", "/view/category/ct306"]
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchLive(path) {
  return new Promise((ok, ng) => {
    const rq = https.get({ host: "www.isp-sp.com", path, timeout: 20000 }, res => {
      const c = [];
      res.on("data", d => c.push(d));
      res.on("end", () => ok(Buffer.concat(c)));
    });
    rq.on("error", ng);
    rq.on("timeout", () => { rq.destroy(); ng(new Error("timeout")); });
  });
}

function decode(buf) {
  let s = buf.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }
  return s;
}

/* 🔴 head は本文ではありません
 *
 *    「夏は熱中症対策が…」は meta description でした。head を混ぜたので、
 *    出るはずのないものを「欠落」と数えていました。 */
function bodyOnly(html) {
  const at = html.search(/<body/i);
  if (at >= 0) { return html.slice(at); }
  /* 🔴 <body> が無いページがあります（ベーシックの出力）。
   *    そのとき全文を返していたので、head の <title> を「本文の欠落」と
   *    数えていました。</head> で切ります。 */
  const h = html.toLowerCase().indexOf("</head>");
  return h >= 0 ? html.slice(h) : html;
}

function chunks(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, "\n")
    .split("\n")
    .map(s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
               .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
               .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
               /* 🔴 名前付きの実体参照も戻します。&raquo; を残していたので、
                *    ページ送りの「次の40件 »」を毎回「欠落」と数えていました。 */
               .replace(/&raquo;/g, "»").replace(/&laquo;/g, "«")
               .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'")
               .split("〜").join("～")
               .replace(/\s+/g, " ").trim())
    .filter(s => s.length >= 10);
}

/* 商品名・価格はカテゴリの中身なので、比べても意味がありません（在庫で変わります）。
   説明文・見出し・案内だけを見たいので、数字と価格の行は外します。 */
function isProductish(s) {
  return /^\d[\d,]*円/.test(s) || /円（税込）$/.test(s) || /^\d+$/.test(s);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const p = await page();

  /* カテゴリのプレビューを1度押して、焼き付けます */
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=4");
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
  }
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  let ptk = "";
  for (let i = 0; i < 30; i++) {
    await sleep(700);
    const u = await p.evaluate("location.href");
    const m = u.match(/ptk=([0-9a-f]+)/);
    if (m) { ptk = m[1]; break; }
  }
  if (!ptk) { console.log("🔴 プレビューのトークンが取れません"); p.close(); return; }

  for (const [name, livePath, viewPath] of CATS) {
    const live = decode(await fetchLive(livePath));
    await p.navigate("https://www.isp-sp.com" + viewPath + "?ptk=" + ptk);
    await sleep(2500);
    const mine = await p.evaluate("document.documentElement.outerHTML");
    fs.writeFileSync(OUT + "/" + name + ".html", mine);

    const a = chunks(bodyOnly(live)).filter(s => !isProductish(s));
    const b = chunks(bodyOnly(mine)).join(" ");
    const missing = a.filter(s => b.indexOf(s) < 0);
    console.log(name.padEnd(8) + "現行 " + String(a.length).padStart(4) + " 塊 / 移植版に無い " +
      String(missing.length).padStart(3));
    missing.slice(0, 4).forEach(s => console.log("      " + s.slice(0, 84)));
  }
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
