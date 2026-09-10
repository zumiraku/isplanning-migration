/* ---------------------------------------------------------------------------
   geometry.js — 現行サイトと移植版で、同じ部品の位置と大きさを突き合わせます

   🔴 「はみ出していない」だけを見ていたのが間違いでした

      山口様のご指摘は**ズレ**です。画面からはみ出していなくても、
      本文の左端が40pxずれていれば、全体がずれて見えます。
      同じセレクタの要素を、現行と移植版で1つずつ測って引き算します。

     node tools/cdp/geometry.js top 1280
     node tools/cdp/geometry.js top 375

   ⚠️ 現行と移植版で中身（商品数など）は違うので、**縦位置は比べません。**
      比べるのは左端・右端・幅です。
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const EDITOR = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

const PAGES = {
  top:         { type: 2,  live: "https://www.isp-sp.com/" },
  detail:      { type: 3,  live: "https://www.isp-sp.com/shopdetail/003001000005/" },
  category:    { type: 4,  live: "https://www.isp-sp.com/shopbrand/all_items/" },
  cart:        { type: 6,  live: "https://www.isp-sp.com/shop/basket.html" },
  search:      { type: 5,  live: "https://www.isp-sp.com/shop/shopbrand.html?search=%A5%BF%A5%AA%A5%EB" },
  "news-list": { type: 9,  live: "https://www.isp-sp.com/new/index.html" },
  policy:      { type: 14, live: "https://www.isp-sp.com/html/privacy.html" },
  guide:       { type: 11, live: "https://www.isp-sp.com/html/info.html" },
  company:     { type: 12, live: "https://www.isp-sp.com/html/company.html" },
  contract:    { type: 13, live: "https://www.isp-sp.com/html/ordercontract.html" }
};

/* 見る部品。現行にも移植版にもあるはずのものだけ */
const MARKS = [
  "#headerWrap", ".header-txt", ".h-txt-inner", "#header", ".head_contents",
  ".logo-box", ".contents_center", ".contents_right", "#gNav", ".head_nav_contents",
  "#bgMain", "#wrapper", "#O_container", "#M_leftContents", ".M_mainContents",
  "#O_adminPagearea", ".M_innerBox", "#M_slider", ".bx-wrapper",
  "#r_new", "#r_recommend", "#r_ranking", "#r_recent", ".rank-wrap", "ul.rank-list",
  "#colum-wrap", "#footer_guideWrap", "#footer", ".f-copy",
  "table.tbl01", "table.tbl02", ".O_ItemLine", ".sideCalender"
];

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const name = process.argv[2] || "top";
const width = Number(process.argv[3] || 1280);
if (!(name in PAGES)) {
  console.error("使い方: node tools/cdp/geometry.js <" + Object.keys(PAGES).join("|") + "> [幅]");
  process.exit(1);
}
const mobile = width < 700;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function probe(marks) {
  return `(function () {
    var marks = ${JSON.stringify(marks)};
    var out = { view: document.documentElement.clientWidth, items: {} };
    marks.forEach(function (sel) {
      var e;
      try { e = document.querySelector(sel); } catch (x) { return; }
      if (!e) { out.items[sel] = null; return; }
      var r = e.getBoundingClientRect();
      var cs = getComputedStyle(e);
      out.items[sel] = {
        l: Math.round(r.left + window.pageXOffset),
        rt: Math.round(r.right + window.pageXOffset),
        w: Math.round(r.width),
        h: Math.round(r.height),
        display: cs.display,
        float: cs.cssFloat,
        ml: cs.marginLeft, mr: cs.marginRight,
        pl: cs.paddingLeft, pr: cs.paddingRight
      };
    });
    return out;
  })()`;
}

async function settle(p) {
  await p.evaluate("window.scrollTo(0, document.body.scrollHeight); 1");
  await sleep(1500);
  await p.evaluate("window.scrollTo(0, 0); 1");
  await sleep(900);
}

(async () => {
  const p = await page();
  await p.send("Emulation.setDeviceMetricsOverride",
    { width: width, height: 900, deviceScaleFactor: 1, mobile: mobile });
  await p.send("Network.setUserAgentOverride",
    { userAgent: mobile ? IPHONE : "", platform: mobile ? "iPhone" : "" });

  await p.navigate("about:blank");
  await sleep(300);
  await p.navigate(PAGES[name].live);
  await sleep(5000);
  await settle(p);
  const live = await p.evaluate(probe(MARKS));

  await p.navigate("about:blank");
  await sleep(300);
  await p.navigate(EDITOR + "?design_set_id=" + SET + "&page_type=" + PAGES[name].type);
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    await sleep(500);
    ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
  }
  if (!ready) { console.log("🔴 編集画面が開けません"); p.close(); return; }
  const wasAt = await p.evaluate("location.href");
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    const u = await p.evaluate("location.href");
    if (u.indexOf("isp-sp.com") >= 0 && u !== wasAt) { break; }
  }
  await sleep(3500);
  await settle(p);
  const nu = await p.evaluate(probe(MARKS));

  console.log(name + " / 幅 " + width + "  （現行 " + live.view + " / 移植版 " + nu.view + "）");
  console.log("");
  console.log("部品".padEnd(22) + "  現行 左..右 (幅)      移植版 左..右 (幅)     ズレ");
  let bad = 0;
  MARKS.forEach(function (sel) {
    const a = live.items[sel], b = nu.items[sel];
    if (!a && !b) { return; }
    if (a && !b) { console.log(sel.padEnd(22) + "  あり                  🔴 移植版に無い"); bad++; return; }
    if (!a && b) { console.log(sel.padEnd(22) + "  －                    移植版のみ " + b.l + ".." + b.rt); return; }
    const dl = b.l - a.l, dw = b.w - a.w;
    const mark = (Math.abs(dl) > 4 || Math.abs(dw) > 8) ? "  🔴" : "";
    if (mark) { bad++; }
    console.log(sel.padEnd(22) +
      ("  " + a.l + ".." + a.rt + " (" + a.w + ")").padEnd(24) +
      (b.l + ".." + b.rt + " (" + b.w + ")").padEnd(23) +
      "左" + (dl >= 0 ? "+" : "") + dl + " 幅" + (dw >= 0 ? "+" : "") + dw + mark);
  });
  console.log("");
  console.log(bad ? "🔴 気になるもの " + bad + " 件" : "✅ 位置と幅は現行と揃っています");

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
