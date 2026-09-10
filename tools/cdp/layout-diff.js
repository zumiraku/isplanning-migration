/* layout-diff.js — 重なり・ズレを、現行サイトと突き合わせて「増えたぶんだけ」出す */
const fs = require("fs");
const { page } = require("./cdp.js");

const EDITOR = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const EXPR = fs.readFileSync(__dirname + "/exprs/overlap.js", "utf8");

const PAGES = {
  top:      { type: 2,  live: "https://www.isp-sp.com/" },
  detail:   { type: 3,  live: "https://www.isp-sp.com/shopdetail/003001000005/" },
  category: { type: 4,  live: "https://www.isp-sp.com/shopbrand/all_items/" },
  cart:     { type: 6,  live: "https://www.isp-sp.com/shop/basket.html" },
  search:   { type: 5,  live: "https://www.isp-sp.com/shop/shopbrand.html?search=%A5%BF%A5%AA%A5%EB" },
  "news-list":   { type: 9,  live: "https://www.isp-sp.com/new/index.html" },
  guide:    { type: 11, live: "https://www.isp-sp.com/html/info.html" },
  company:  { type: 12, live: "https://www.isp-sp.com/html/company.html" },
  contract: { type: 13, live: "https://www.isp-sp.com/html/ordercontract.html" }
};

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const name = process.argv[2] || "top";
const width = Number(process.argv[3] || 1280);
if (!(name in PAGES)) {
  console.error("使い方: node tools/cdp/layout-diff.js <" + Object.keys(PAGES).join("|") + "> [幅]");
  process.exit(1);
}
const mobile = width < 700;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function settle(p) {
  await p.evaluate("window.scrollTo(0, document.body.scrollHeight); 1");
  await sleep(1400);
  await p.evaluate("window.scrollTo(0, 0); 1");
  await sleep(700);
}

function keyOverlap(o) { return o.a.replace(/\[.*?\]/g, "[]") + " × " + o.b.replace(/\[.*?\]/g, "[]"); }
function keyOut(o) { return o.what.replace(/\[.*?\]/g, "[]") + " ← " + o.parent; }

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
  const live = await p.evaluate(EXPR);

  await p.navigate("about:blank");
  await sleep(300);
  await p.navigate(EDITOR + "?design_set_id=" + SET + "&page_type=" + PAGES[name].type);
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    await sleep(500);
    ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
  }
  if (!ready) { console.log("※ 編集画面が開けません"); p.close(); return; }
  const wasAt = await p.evaluate("location.href");
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    const u = await p.evaluate("location.href");
    if (u.indexOf("isp-sp.com") >= 0 && u !== wasAt) { break; }
  }
  await sleep(3500);
  await settle(p);
  const nu = await p.evaluate(EXPR);

  console.log(name + " / 幅 " + width);
  console.log("               現行      移植版");
  console.log("重なり        " + String(live.count.重なり).padStart(5) + String(nu.count.重なり).padStart(11));
  console.log("親からはみ出し " + String(live.count.親からはみ出し).padStart(4) + String(nu.count.親からはみ出し).padStart(11));
  console.log("文字切れ      " + String(live.count.文字切れ).padStart(5) + String(nu.count.文字切れ).padStart(11));
  console.log("つぶれ        " + String(live.count.つぶれ).padStart(5) + String(nu.count.つぶれ).padStart(11));
  console.log("");

  const liveOv = new Set(live.overlaps.map(keyOverlap));
  const liveOut = new Set(live.outOfParent.map(keyOut));
  const newOv = nu.overlaps.filter(function (o) { return !liveOv.has(keyOverlap(o)); });
  const newOut = nu.outOfParent.filter(function (o) { return !liveOut.has(keyOut(o)); });

  if (newOv.length) {
    console.log("※ 移植版にだけ出る重なり " + newOv.length + " 件");
    newOv.forEach(function (o) { console.log("   " + o.pct + "%  " + o.a + "  ×  " + o.b); });
  }
  if (newOut.length) {
    console.log("※ 移植版にだけ出るはみ出し " + newOut.length + " 件");
    newOut.forEach(function (o) {
      console.log("   " + o.what + "  （" + o.parent + " から 右" + o.右 + " 左" + o.左 + " 下" + o.下 + "）");
    });
  }
  if (!newOv.length && !newOut.length) {
    console.log("OK 移植版で新しく増えた重なり・はみ出しはありません");
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

