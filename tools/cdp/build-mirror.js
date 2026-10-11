const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");
const { openAt, sleep } = require("./bind.js");
const { PAGES, landed } = require("./pages.js");

const OUT = "mirror";
const SITE = "https://www.isp-sp.com";
const CSS = "package/paste/all-pages.css";
const JS = "package/paste/all-pages.js";

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
  html = html.replace(/<link[^>]+href="\/view\/asset\/user-[^"]*"[^>]*>/g,
    "<style>\n" + css + "\n</style>");
  html = html.replace(/<script[^>]+src="\/view\/asset\/user-[^"]*"[^>]*><\/script>/g,
    "<script>\n" + js + "\n</script>");

  html = html.replace(/<script\b[^>]*>[\s\S]*?document\.write[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script\b[^>]+src="[^"]*(rcmd|komi)[^"]*"[^>]*><\/script>/gi, "");

  html = html.replace(/\b(href|src)="(\/[^"]*)"/g, function (all, attr, u) {
    if (attr === "href") {
      const f = localFor(u);
      if (f) { return 'href="' + f + '"'; }
    }
    return attr + '="' + SITE + u + '"';
  });

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

