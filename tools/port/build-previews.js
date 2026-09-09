/* ---------------------------------------------------------------------------
   build-previews.js — 移植版のプレビューHTMLを作る

   🔴 なぜ要るのか

      移植のあと、check-browser と check-overflow を退役させました。
      あの2本が読んでいた templates/creator/preview/*.html は、**差し戻された
      設計のモック**だったからです。結果として、いま
      **レスポンシブを測るものが1つもありません。**

      ご依頼の1番目が「HTML・CSSの作り込みが崩れないこと（レスポンシブ）」
      でした。測らないまま出すわけにはいきません。

   🔴 モックを手書きしません

      前の preview/*.html は手で書いたHTMLで、**出荷するテンプレートとは
      別物**でした。並び替えバーを <select> で書いてあって、実際に出荷して
      いたのは <nav> のリンク ── 撮影して確認していたのは、一度も出荷して
      いない画面でした。

      ここでは出荷するテンプレートを実際に描画して書き出します。
      ずれようがありません。

   モジュールも本物を入れます

      ヘッダー・左メニュー・フッターは $module.* で、fixture では
      ただの文字列です。本物を描画して差し込まないと、いちばん幅が要る
      部分（1200pxのヘッダー、200pxの左メニュー）が抜けたまま測ることに
      なります。
--------------------------------------------------------------------------- */
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
    try { fs.unlinkSync(tmp); } catch (e) { /* 消せなくても止めない */ }
  }
}

const common = readJson(FIX + "/_common.json");

/* プレビューは手元のファイルを読みます。配信URLのままだと何も当たりません。 */
common.page = Object.assign({}, common.page, {
  css: "../mode/all-pages.css",
  javascript: "../mode/all-pages.js"
});

/* --- モジュールを本物に差し替える ------------------------------------------ */
const modules = ["header", "leftmenu", "footer", "calendar1", "calendar2", "freespace_calendar"];
const rendered = {};
for (const m of modules) {
  const p = "package/modules/" + m + ".tpl";
  if (!fs.existsSync(p)) { console.error("🔴 モジュールがありません: " + p); process.exit(1); }
  rendered[m] = render(p, common);
}
/* カレンダーは左メニューの中から呼ばれるので、先に入れてから左メニューを
   描き直します。1回目は $module.calendar1 が空のままです。 */
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

/* 古いモックが残っていると、検査がそちらを測り続けます。消してから作ります。
 *
 * 🔴 verify-*.html は消しません
 *
 *    JSの検証台で、ここで生成するものではありません。最初は .html を
 *    全部消していて、**verify-chrome.html を毎回巻き添えにしていました**
 *    （check-browser が「ファイルがありません」で落ちて気づきました）。 */
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
              (left ? "   🔴 未展開 " + left : ""));
  n++;
}
console.log("");
console.log(n + " 枚を " + OUT + " に書き出しました（出荷するテンプレートを描画したものです）");
