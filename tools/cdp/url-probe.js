const { page } = require("./cdp.js");

const PAIRS = [
  ["商品（12桁）",      "/shopdetail/003001000005/", "/view/item/003001000005"],
  ["カテゴリ（3階層）",  "/shopbrand/003/001/X/",     "/view/category/ct5"],
  ["カテゴリ（2階層）",  "/shopbrand/003/X/",         "/view/category/ct4"],
  ["カテゴリ（ct形式）", "/shopbrand/ct655/",         "/view/category/ct655"],
  ["すべての商品",      "/shopbrand/all_items/",     "/view/category/all_items"],
  ["独自ページ",        "/html/page9.html",          "/view/page/page9.html"],
  ["案内（利用案内）",   "/html/info.html",           "/view/guide"],
  ["案内（会社概要）",   "/html/company.html",        "/view/company"],
  ["案内（特商法）",     "/html/ordercontract.html",  "/view/contract"],
  ["お知らせ一覧",      "/new/index.html",           "/view/news/list"],
  ["お知らせ詳細",      "/new/2026-07-28-033258.html", "/view/news/20260728033258"],
  ["追加URL（.htm）",   "/nt1201.htm",               null],
  ["追加URL（拡張子なし）", "/TS330",                 null],
  ["買い物カゴ",        "/shop/basket.html",         "/view/cart"],
  ["検索結果",          "/shop/shopbrand.html?search=%A5%BF%A5%AA%A5%EB", "/view/search?search_keyword=%E3%82%BF%E3%82%AA%E3%83%AB"]
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const PROBE = `(function (u) {
  return fetch(u, { redirect: "follow" })
    .then(function (r) {
      return r.text().then(function (t) {
        return {
          status: r.status,
          finalUrl: r.url,
          redirected: r.redirected,
          len: t.length,
          isError: /\\/error\\/404\\.html/.test(r.url) || t.indexOf("このページは3秒後に") >= 0
        };
      });
    })
    .catch(function (e) { return { err: String(e).slice(0, 60) }; });
})`;

(async () => {
  const p = await page();
  await p.navigate("https://www.isp-sp.com/");
  await sleep(4000);

  console.log("いまの本番（ベーシックモード）で測ります");
  console.log("");
  console.log("形                    旧URL                  新URL（/view/…）");
  let bad = 0;

  for (const [label, oldU, newU] of PAIRS) {
    const a = await p.evaluate("(" + PROBE + ")(" + JSON.stringify("https://www.isp-sp.com" + oldU) + ")");
    let b = null;
    if (newU) {
      b = await p.evaluate("(" + PROBE + ")(" + JSON.stringify("https://www.isp-sp.com" + newU) + ")");
    }

    function mark(r) {
      if (!r) { return "（無し）"; }
      if (r.err) { return "※ " + r.err; }
      if (r.isError) { return "※ 404"; }
      if (r.status !== 200) { return "※ " + r.status; }
      return "200" + (r.redirected ? "→転送" : "");
    }
    const am = mark(a), bm = mark(b);
    if (am.indexOf("※") >= 0) { bad++; }
    if (newU && bm.indexOf("※") >= 0) { bad++; }

    console.log(label.padEnd(20) + am.padEnd(22) + bm);
    if (b && b.finalUrl && b.redirected) {
      console.log("".padEnd(20) + "  → " + b.finalUrl.replace("https://www.isp-sp.com", "").slice(0, 60));
    }
    await sleep(300);
  }

  p.close();
  console.log("");
  console.log(bad ? "※ 気になるもの " + bad + " 件" : "OK どの形も、旧・新の両方が生きています");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

