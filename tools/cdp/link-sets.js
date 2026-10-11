const fs = require("fs");
const { page } = require("./cdp.js");
const { map } = require("../port/url-map.js");
const { PAGES, landed } = require("./pages.js");
const { openAt } = require("./bind.js");

const EXPR = fs.readFileSync(__dirname + "/exprs/link-sets.js", "utf8");

const only = process.argv[2];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const SAME_RAW = [
  ["javascript:ssl_login('member')", "会員登録"],
  ["/shop/idinfo.html", "会員登録"],
  ["javascript:ssl_login('login')", "ログイン"],
  ["/view/member/login", "ログイン"],
  ["javascript:top_sendmail()", "問合せ"],
  ["javascript:bottom_sendmail()", "問合せ"],
  ["#makeshop-common-contact-url", "問合せ"],
  ["/shop/basket.html", "かご"],
  ["/view/cart", "かご"],
  ["javascript:void(0)", "検索"],
  ["#makeshop-common-search-url", "検索"],
  ["javascript:bottom_privercy()", "個人情報"],
  ["/view/policy", "個人情報"]
];
const SAME = new Map();
SAME_RAW.forEach(function (p) { SAME.set(p[0], p[1]); SAME.set(p[0].toLowerCase(), p[1]); });

function canon(href) {
  let u = (href || "").trim();
  u = u.replace(/^https?:\/\/www\.isp-sp\.com/i, "");
  if (SAME.has(u.toLowerCase())) { return SAME.get(u.toLowerCase()); }
  if (SAME.has(u)) { return SAME.get(u); }
  if (!u || u.startsWith("#") || u.startsWith("javascript:") ||
      u.startsWith("mailto:") || u.startsWith("tel:")) { return u; }
  if (map.has(u)) { return String(map.get(u)); }
  const hash = u.indexOf("#");
  if (hash > 0 && map.has(u.slice(0, hash))) { return String(map.get(u.slice(0, hash))) + u.slice(hash); }
  u = u.replace(/^\/shopbrand\/(ct\d+)\/?$/, "/view/category/$1");
  u = u.replace(/^\/shopdetail\/(\d+)\/?$/, "/view/item/$1");
  u = u.replace(/\/$/, "");
  return u;
}

function split(entry) {
  const at = entry.lastIndexOf(" ⟨");
  return { href: entry.slice(0, at), text: entry.slice(at + 2, -1) };
}

(async () => {
  const p = await page();
  let bad = 0;

  for (const [name, livePath, portPath, type] of PAGES) {
    if (only && only !== livePath && only !== name) { continue; }

    await p.navigate("about:blank"); await sleep(250);
    await p.navigate("https://www.isp-sp.com" + livePath); await sleep(4200);
    const at = await p.evaluate("location.href");
    if (!landed(livePath, at)) {
      console.log("");
      console.log("※ " + name + " ── 現行 " + livePath + " は " + at + " に飛ばされました。測りません");
      bad++; continue;
    }
    const live = await p.evaluate(EXPR);
    const bound = await openAt(p, type, portPath, 4200);
    if (!bound.ok) { console.log(""); console.log("※ " + name + " ── " + bound.why); bad++; continue; }
    const nu = await p.evaluate(EXPR);

    console.log("");
    console.log("========== " + name + "   " + livePath);
    for (const region of ["ヘッダー", "左メニュー", "フッター"]) {
      const a = live[region], b = nu[region];
      if (!a && !b) { console.log("  " + region.padEnd(8) + "どちらにもありません"); continue; }
      if (!a) { console.log("  " + region.padEnd(8) + "※ 現行に枠がありません"); continue; }
      if (!b) { console.log("  " + region.padEnd(8) + "※ 移植版に枠がありません"); bad++; continue; }

      const A = a.map(split), B = b.map(split);
      const bHref = new Set(B.map(x => canon(x.href)));
      const aHref = new Set(A.map(x => canon(x.href)));
      const lost = A.filter(x => !bHref.has(canon(x.href)));
      const extra = B.filter(x => !aHref.has(canon(x.href)));

      const byHref = new Map();
      B.forEach(x => byHref.set(canon(x.href), x.text));
      const renamed = A.filter(x => bHref.has(canon(x.href)) && byHref.get(canon(x.href)) !== x.text);

      const mark = (lost.length || extra.length) ? "※" : "  ";
      console.log("  " + mark + region.padEnd(8) + "現行 " + String(a.length).padStart(4) +
        " / 移植版 " + String(b.length).padStart(4) +
        "   消えた " + lost.length + " / 増えた " + extra.length + " / 名前が変わった " + renamed.length);
      if (lost.length) { bad += lost.length; }
      lost.slice(0, 12).forEach(x => console.log("       - " + x.href + "  「" + x.text + "」"));
      extra.slice(0, 6).forEach(x => console.log("       + " + x.href + "  「" + x.text + "」"));
      renamed.slice(0, 6).forEach(x =>
        console.log("       ~ " + canon(x.href) + "  「" + x.text + "」→「" + byHref.get(canon(x.href)) + "」"));
    }
  }

  p.close();
  console.log("");
  console.log(bad ? "※ 消えたリンク・枠 " + bad + " 件" : "OK どのページも、リンクは現行と同じ集合です");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

