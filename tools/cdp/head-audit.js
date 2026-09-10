/* head-audit.js — <head> の中身を、現行と1項目ずつ突き合わせます */
const { page } = require("./cdp.js");

const EDITOR = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

const PAGES = {
  top:         { type: 2,  live: "https://www.isp-sp.com/" },
  detail:      { type: 3,  live: "https://www.isp-sp.com/shopdetail/003001000005/" },
  category:    { type: 4,  live: "https://www.isp-sp.com/shopbrand/all_items/" },
  cart:        { type: 6,  live: "https://www.isp-sp.com/shop/basket.html" },
  "news-list": { type: 9,  live: "https://www.isp-sp.com/new/index.html" },
  guide:       { type: 11, live: "https://www.isp-sp.com/html/info.html" },
  company:     { type: 12, live: "https://www.isp-sp.com/html/company.html" },
  contract:    { type: 13, live: "https://www.isp-sp.com/html/ordercontract.html" }
};

const READ = `(function () {
  function meta(sel, attr) {
    var e = document.querySelector(sel);
    return e ? (e.getAttribute(attr || "content") || "") : null;
  }
  var out = {
    title: document.title || "",
    description: meta('meta[name="description"]'),
    keywords: meta('meta[name="keywords"]'),
    canonical: meta('link[rel="canonical"]', "href"),
    robots: meta('meta[name="robots"]'),
    googlebot: meta('meta[name="googlebot"]'),
    ogType: meta('meta[property="og:type"]'),
    ogTitle: meta('meta[property="og:title"]'),
    ogDesc: meta('meta[property="og:description"]'),
    ogImage: meta('meta[property="og:image"]', "content"),
    ogSite: meta('meta[property="og:site_name"]'),
    ogUrl: meta('meta[property="og:url"]'),
    twitter: meta('meta[name="twitter:card"]'),
    viewport: meta('meta[name="viewport"]'),
    favicon: meta('link[rel="shortcut icon"], link[rel="icon"]', "href"),
    charset: (document.characterSet || ""),
    lang: document.documentElement.getAttribute("lang") || "",
    /* 外から読み込んでいるもの */
    hosts: (function () {
      var h = {};
      Array.from(document.querySelectorAll("script[src], link[rel=stylesheet]")).forEach(function (e) {
        var u = e.src || e.href || "";
        var m = u.match(/^https?:\\/\\/([^\\/]+)/);
        if (m && m[1].indexOf("isp-sp.com") < 0) { h[m[1]] = 1; }
      });
      return Object.keys(h).sort();
    })(),
    ga4: (document.documentElement.innerHTML.match(/G-[A-Z0-9]{8,}/) || [null])[0],
    structured: document.querySelectorAll('script[type="application/ld+json"]').length
  };
  return out;
})()`;

const FIELDS = [
  ["title", "タイトル"],
  ["description", "説明文（meta description）"],
  ["keywords", "キーワード"],
  ["canonical", "canonical"],
  ["robots", "robots"],
  ["googlebot", "googlebot"],
  ["ogTitle", "og:title"],
  ["ogDesc", "og:description"],
  ["ogImage", "og:image"],
  ["ogSite", "og:site_name"],
  ["ogType", "og:type"],
  ["twitter", "twitter:card"],
  ["favicon", "favicon"],
  ["lang", "lang"],
  ["ga4", "GA4"],
  ["structured", "構造化データ"]
];

const only = process.argv[2];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function norm(v) {
  if (v === null || v === undefined) { return "(無し)"; }
  return String(v).replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();
}

(async () => {
  const p = await page();
  let bad = 0;

  for (const name of Object.keys(PAGES)) {
    if (only && only !== name) { continue; }
    const cfg = PAGES[name];

    await p.navigate("about:blank");
    await sleep(300);
    await p.navigate(cfg.live);
    await sleep(4500);
    const live = await p.evaluate(READ);

    await p.navigate("about:blank");
    await sleep(300);
    await p.navigate(EDITOR + "?design_set_id=" + SET + "&page_type=" + cfg.type);
    let ready = false;
    for (let i = 0; i < 60 && !ready; i++) {
      await sleep(500);
      ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
    }
    if (!ready) { console.log(name + "  ※ 編集画面が開けません"); bad++; continue; }
    const wasAt = await p.evaluate("location.href");
    await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
    for (let i = 0; i < 40; i++) {
      await sleep(700);
      const u = await p.evaluate("location.href");
      if (u.indexOf("isp-sp.com") >= 0 && u !== wasAt) { break; }
    }
    await sleep(3200);
    const nu = await p.evaluate(READ);

    console.log("");
    console.log("========== " + name);
    let ng = 0;
    for (const [key, label] of FIELDS) {
      const a = norm(live[key]), b = norm(nu[key]);
      if (a === b) { continue; }
      ng++;
      console.log("  ※ " + label);
      console.log("     現行  : " + a.slice(0, 110));
      console.log("     移植版: " + b.slice(0, 110));
    }
    const gone = live.hosts.filter(h => nu.hosts.indexOf(h) < 0);
    const added = nu.hosts.filter(h => live.hosts.indexOf(h) < 0);
    if (gone.length) { ng++; console.log("  ※ 読み込まれなくなった外部: " + gone.join(" ")); }
    if (added.length) { console.log("  ＋ 増えた外部: " + added.join(" ")); }

    if (!ng) { console.log("  OK head は現行と揃っています"); }
    bad += ng;
  }

  p.close();
  console.log("");
  console.log(bad ? "※ 違いが 合計 " + bad + " 件" : "OK すべての head が現行と揃っています");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

