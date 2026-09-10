/* ---------------------------------------------------------------------------
   compare-shots.js — 現行サイトと移植版を、同じ幅・同じ位置で撮って並べます

   🔴 これが最初から必要でした

      「はみ出していない」を測って合格にしていましたが、山口様のご指摘は
      **ズレと重なり**です。現行と並べないと判断できません。

     node tools/cdp/compare-shots.js top 1280
     node tools/cdp/compare-shots.js top 375
     node tools/cdp/compare-shots.js detail 1280 4     4枚目だけ

   保存先
     tools/cdp/shots/<ページ>-<幅>-<番号>-live.png    現行サイト
     tools/cdp/shots/<ページ>-<幅>-<番号>-new.png     移植版

   ⚠️ 追従ヘッダーは撮影のあいだだけ止めます（毎タイルに写り込むため）。
      止めているのは撮影用の一時指定で、保存内容は触りません。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const EDITOR = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const OUT = "tools/cdp/shots";

/* 左が移植版のページ種別、右が現行サイトの同じページ */
const PAGES = {
  top:         { type: 2,  live: "https://www.isp-sp.com/" },
  detail:      { type: 3,  live: "https://www.isp-sp.com/shopdetail/003001000005/" },
  category:    { type: 4,  live: "https://www.isp-sp.com/shopbrand/all_items/" },
  search:      { type: 5,  live: "https://www.isp-sp.com/shop/shopbrand.html?search=" },
  cart:        { type: 6,  live: "https://www.isp-sp.com/shop/basket.html" },
  "news-list": { type: 9,  live: "https://www.isp-sp.com/new/index.html" },
  guide:       { type: 11, live: "https://www.isp-sp.com/html/info.html" },
  company:     { type: 12, live: "https://www.isp-sp.com/html/company.html" },
  contract:    { type: 13, live: "https://www.isp-sp.com/html/ordercontract.html" },
  policy:      { type: 14, live: "https://www.isp-sp.com/html/privacy.html" }
};

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const name = process.argv[2];
const width = Number(process.argv[3] || 1280);
const onlyTile = Number(process.argv[4] || 0);
if (!name || !(name in PAGES)) {
  console.error("使い方: node tools/cdp/compare-shots.js <" + Object.keys(PAGES).join("|") + "> [幅] [番号]");
  process.exit(1);
}
const TILE = width < 700 ? 740 : 900;
const mobile = width < 700;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* 追従ヘッダーと固定の引き出しを、撮影のあいだだけ止めます */
const FREEZE = `(function(){
  var s = document.getElementById("__shotfix");
  if (!s) {
    s = document.createElement("style");
    s.id = "__shotfix";
    s.textContent = "#headerWrap{position:static !important;}" +
                    ".l-menu-scrim{display:none !important;}" +
                    "*{scroll-behavior:auto !important;}";
    document.head.appendChild(s);
  }
  return 1;
})()`;

async function settle(p) {
  await p.evaluate("window.scrollTo(0, document.body.scrollHeight); 1");
  await sleep(1600);
  await p.evaluate("window.scrollTo(0, 0); 1");
  await sleep(900);
  await p.evaluate(FREEZE);
  await sleep(400);
  return p.evaluate(`(function(){
    var d = document.documentElement, b = document.body;
    return Math.max(d.scrollHeight, b.scrollHeight);
  })()`);
}

async function tile(p, y, h, file) {
  await p.evaluate("window.scrollTo(0, " + y + "); 1");
  await sleep(500);
  const shot = await p.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(file, Buffer.from(shot.result.data, "base64"));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const p = await page();

  await p.send("Emulation.setDeviceMetricsOverride",
    { width: width, height: TILE, deviceScaleFactor: 1, mobile: mobile });
  await p.send("Network.setUserAgentOverride",
    { userAgent: mobile ? IPHONE : "", platform: mobile ? "iPhone" : "" });

  /* ── 現行サイト ── */
  await p.navigate("about:blank");
  await sleep(300);
  await p.navigate(PAGES[name].live);
  await sleep(5000);
  const liveH = await settle(p);
  const liveN = Math.ceil(liveH / TILE);
  console.log("現行   高さ " + liveH + "  → " + liveN + " 枚");
  for (let i = 0; i < liveN && i < 16; i++) {
    if (onlyTile && onlyTile !== i + 1) { continue; }
    const f = OUT + "/" + name + "-" + width + "-" + String(i + 1).padStart(2, "0") + "-live.png";
    await tile(p, i * TILE, TILE, f);
    console.log("   " + String(i + 1).padStart(2) + "  → " + f);
  }

  /* ── 移植版（プレビュー） ── */
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
  const newH = await settle(p);
  const newN = Math.ceil(newH / TILE);
  console.log("移植版 高さ " + newH + "  → " + newN + " 枚");
  for (let i = 0; i < newN && i < 16; i++) {
    if (onlyTile && onlyTile !== i + 1) { continue; }
    const f = OUT + "/" + name + "-" + width + "-" + String(i + 1).padStart(2, "0") + "-new.png";
    await tile(p, i * TILE, TILE, f);
    console.log("   " + String(i + 1).padStart(2) + "  → " + f);
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
