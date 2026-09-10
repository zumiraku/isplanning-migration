/* tiles.js — 1ページを、読める大きさに切って撮ります */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const OUT = "tools/cdp/shots";

const TYPE = {
  top: 2, detail: 3, category: 4, search: 5, cart: 6,
  "news-list": 9, "news-detail": 10, guide: 11, company: 12,
  contract: 13, policy: 14
};

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const name = process.argv[2];
const width = Number(process.argv[3] || 1280);
const onlyTile = Number(process.argv[4] || 0);
if (!name || !(name in TYPE)) {
  console.error("使い方: node tools/cdp/tiles.js <" + Object.keys(TYPE).join("|") + "> [幅] [番号]");
  process.exit(1);
}
const TILE = width < 700 ? 760 : 950;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const p = await page();
  const mobile = width < 700;

  await p.send("Emulation.setDeviceMetricsOverride",
    { width: width, height: 900, deviceScaleFactor: 1, mobile: mobile });
  await p.send("Network.setUserAgentOverride",
    { userAgent: mobile ? IPHONE : "", platform: mobile ? "iPhone" : "" });

  await p.navigate("about:blank");
  await sleep(300);
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE[name]);
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
  await sleep(4000);

  await p.evaluate("window.scrollTo(0, document.body.scrollHeight); 1");
  await sleep(1500);
  await p.evaluate("window.scrollTo(0, 0); 1");
  await sleep(800);

  const size = await p.evaluate(`(function(){
    var d = document.documentElement, b = document.body;
    return { h: Math.max(d.scrollHeight, b.scrollHeight) };
  })()`);
  const total = Math.min(size.h, 20000);
  const n = Math.ceil(total / TILE);
  console.log(name + " " + width + "px  高さ " + total + "  → " + n + " 枚");

  await p.send("Emulation.setDeviceMetricsOverride",
    { width: width, height: total, deviceScaleFactor: 1, mobile: mobile });
  await sleep(1200);

  for (let i = 0; i < n; i++) {
    if (onlyTile && onlyTile !== i + 1) { continue; }
    const y = i * TILE;
    const h = Math.min(TILE, total - y);
    const shot = await p.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: y, width: width, height: h, scale: 1 }
    });
    const file = OUT + "/" + name + "-" + width + "-" + String(i + 1).padStart(2, "0") + ".png";
    fs.writeFileSync(file, Buffer.from(shot.result.data, "base64"));
    console.log("   " + String(i + 1).padStart(2) + "  y " + String(y).padStart(6) + "  → " + file);
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

