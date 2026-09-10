/* ---------------------------------------------------------------------------
   build-mirror.js — 移植版を、そのまま開ける静的な写しにします

   ※ プレビューでは、移植版を見ていただけません

      実測（2026-09-10）:

        Cookie無しで /?ptk=…            → 200 だが EUC-JP。**現行サイト**です
        Cookie無しで /view/cart?ptk=…   → 301 で /shop/basket.html へ
        管理画面でプレビューを押した直後  → **押した種別の中身**がどのURLにも出ます

      つまり、リンクをお渡ししても移植版は見えません。押した1種別だけが
      正しく、そこから他のページへ移ると中身が入れ替わります。
      タイトルだけはURLどおりなので、一見それらしく見えます。

      さらに、こちらのCSSとJavaScriptは Cookie 無しだと空で返ります。

        /view/asset/user-…css   19 バイト（本当は約190KB）
        /view/asset/user-…js     1 バイト（本当は約8KB）

   だから、**種別ごとに正しく結び直して取り込み、CSSとJavaScriptを中に
   埋め込んだHTML**を書き出します。フォルダを開けば、そのままブラウザで
   見られます。ページ間のリンクも写しの中でつながります。

     node tools/cdp/build-mirror.js

   書き出し先: mirror/
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");
const { openAt, sleep } = require("./bind.js");
const { PAGES, landed } = require("./pages.js");

const OUT = "mirror";
const SITE = "https://www.isp-sp.com";
const CSS = "package/paste/all-pages.css";
const JS = "package/paste/all-pages.js";

/* 写しの中のファイル名。pages.js の名前から作ります。 */
const FILE = {
  "トップ": "top.html",
  "カテゴリ": "category.html",
  "商品詳細": "detail.html",
  "カゴ": "cart.html",
  "お知らせ一覧": "news-list.html",
  "お知らせ詳細": "news-detail.html",
  "ご利用ガイド": "guide.html",
  "会社概要": "company.html",
  "取引条件": "contract.html",
  "個人情報": "policy.html"
};

/* 移植版のURLの形 → 写しのファイル。順番に見て、最初に当たったものを使います。 */
const LINKS = [
  [/^\/view\/category\/[^"'?#]*/, "category.html"],
  [/^\/view\/item\/[^"'?#]*/, "detail.html"],
  [/^\/view\/search(\?[^"']*)?$/, "search.html"],
  [/^\/view\/cart\/?$/, "cart.html"],
  [/^\/view\/news\/list\/?$/, "news-list.html"],
  [/^\/view\/news\/[0-9]+\/?$/, "news-detail.html"],
  [/^\/view\/guide(#[^"']*)?$/, "guide.html"],
  [/^\/view\/company\/?$/, "company.html"],
  [/^\/view\/contract\/?$/, "contract.html"],
  [/^\/view\/policy\/?$/, "policy.html"],
  [/^\/$/, "top.html"]
];

function localFor(u) {
  for (const [re, f] of LINKS) {
    const m = u.match(re);
    if (m) {
      const hash = (u.match(/#[^"']*$/) || [""])[0];
      return f + hash;
    }
  }
  return null;
}

function rewrite(html, css, js) {
  /* こちらのCSSとJavaScriptを埋め込みます（Cookie無しでは空で返るため）
     ※ 資産のURLには問合せが付きます。

          /view/asset/user-5-1-2-….css?ptk=…&6aa265d36467f

        最初 `\.css"` で終わる形だけを見ていたので1つも置き換わらず、
        **写しが丸ごと素のHTML**になっていました（CSSの規則0本）。 */
  html = html.replace(/<link[^>]+href="\/view\/asset\/user-[^"]*"[^>]*>/g,
    "<style>\n" + css + "\n</style>");
  html = html.replace(/<script[^>]+src="\/view\/asset\/user-[^"]*"[^>]*><\/script>/g,
    "<script>\n" + js + "\n</script>");

  /* ※ document.write を呼ぶスクリプトを外します
   *
   *    イーレコメンド（rcmd.jp）の設置タグは document.write でスクリプトを
   *    足します。読み込みが終わったあとの document.write は**ページを
   *    まるごと消します。** 写しを開くと、商品詳細だけ本文が2,431文字・
   *    画像13枚になっていました（本来は約8,000文字・116枚）。
   *
   *    出た中身は取り込んだ時点のDOMに入っているので、**もう一度
   *    走らせる必要がありません。** 呼ぶ側だけ外します。 */
  html = html.replace(/<script\b[^>]*>[\s\S]*?document\.write[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script\b[^>]+src="[^"]*(rcmd|komi)[^"]*"[^>]*><\/script>/gi, "");

  /* href / src の中を1つずつ見ます */
  html = html.replace(/\b(href|src)="(\/[^"]*)"/g, function (all, attr, u) {
    if (attr === "href") {
      const f = localFor(u);
      if (f) { return 'href="' + f + '"'; }
    }
    return attr + '="' + SITE + u + '"';
  });

  /* 写しだと分かる印を、いちばん上に置きます */
  html = html.replace(/<body([^>]*)>/i, '<body$1>\n' +
    '<div style="background:#0b6;color:#fff;font:14px/1.6 sans-serif;padding:8px 12px;text-align:center">' +
    'これは移植版の写しです（' + new Date().toISOString().slice(0, 10) + ' 時点）。' +
    '商品や価格は本番のものです。ページ間のリンクは、同じ種類の代表ページへつながります。' +
    '</div>');
  return html;
}

(async () => {
  if (!fs.existsSync(CSS) || !fs.existsSync(JS)) {
    console.error("※ " + CSS + " か " + JS + " がありません");
    process.exit(1);
  }
  const css = fs.readFileSync(CSS, "utf8");
  const js = fs.readFileSync(JS, "utf8");
  fs.mkdirSync(OUT, { recursive: true });

  const p = await page();
  const made = [];
  for (const [name, livePath, portPath, type] of PAGES) {
    const file = FILE[name];
    if (!file) { console.log("   " + name + " は写しに入れません（対応表に無い）"); continue; }
    const bound = await openAt(p, type, portPath, 9000);
    if (!bound.ok) { console.log("※ " + name + " ── " + bound.why); continue; }
    const html = await p.evaluate("document.documentElement.outerHTML");
    const out = rewrite(html, css, js);
    fs.writeFileSync(path.join(OUT, file), "<!doctype html>\n" + out);
    made.push([name, file, out.length]);
    console.log("   " + name.padEnd(14) + file.padEnd(18) + Math.round(out.length / 1024) + " KB");
  }

  /* 検索は pages.js に無いので、種別5を足します */
  const bound = await openAt(p, 5, "/view/search?search_keyword=ND-P3841", 9000);
  if (bound.ok) {
    const html = await p.evaluate("document.documentElement.outerHTML");
    const out = rewrite(html, css, js);
    fs.writeFileSync(path.join(OUT, "search.html"), "<!doctype html>\n" + out);
    made.push(["検索", "search.html", out.length]);
    console.log("   " + "検索".padEnd(14) + "search.html".padEnd(18) + Math.round(out.length / 1024) + " KB");
  }
  p.close();

  const idx = [
    "<!doctype html><meta charset=utf-8><title>移植版の写し</title>",
    "<style>body{font:16px/1.9 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 16px}",
    "h1{font-size:22px}li{margin:6px 0}code{background:#eee;padding:2px 6px;border-radius:4px}</style>",
    "<h1>移植版の写し</h1>",
    "<p>管理画面のプレビューは、<strong>最後に開いた1種類のページ</strong>を、どのURLにも出します。",
    "そのままでは全体をご覧いただけないので、種類ごとに正しく開いたものを、そのまま保存しました。</p>",
    "<p>下のリンクをクリックすると、その画面が開きます。ページの中のリンクも、この写しの中でつながります。</p>",
    "<ul>",
    ...made.map(([name, file]) => '<li><a href="' + file + '">' + name + "</a></li>"),
    "</ul>",
    "<p>撮った日: " + new Date().toISOString().slice(0, 10) + "</p>"
  ].join("\n");
  fs.writeFileSync(path.join(OUT, "index.html"), idx);

  console.log("");
  console.log("OK " + made.length + " 枚を " + OUT + "/ に書き出しました（index.html から開けます）");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
